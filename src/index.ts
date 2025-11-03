/**
 * Types for the Perspective (Comment Analyzer) API
 * See: https://developers.perspectiveapi.com/s/about-the-api-methods
 */

/**
 * The type of text contained in a `Comment` or `ContextEntry`.
 * Currently supported: `PLAIN_TEXT` (recommended). `HTML` is listed but
 * behavior for HTML may be different; using plain text is safest.
 */
export type TextType = 'PLAIN_TEXT' | 'HTML';

/**
 * A piece of text to be scored by the API.
 *
 * comment.text is required.
 */
export interface Comment {
    /**
     * (required) The text to score. This is assumed to be utf8 raw text of the
     * text to be checked. Emoji and other non-ascii characters can be included.
     * HTML will probably result in lower performance.
     */
    text: string;

    /**
     * (optional) The text type of comment.text. Either "PLAIN_TEXT" or "HTML".
     * Currently only "PLAIN_TEXT" is supported.
     */
    type?: TextType;
}

/**
 * A context entry provides surrounding text context for the comment. The API
 * currently does not make use of this field but it may influence responses
 * in the future.
 */
export interface ContextEntry {
    /** Optional text for the context entry. Max size per entry ~1MB. */
    text?: string;

    /**
     * Optional text type for this context entry. Same type as comment.text.
     * Currently only "PLAIN_TEXT" is supported.
     */
    type?: TextType;
}

/** Optional context container holding zero or more context entries. */
export interface Context {
    entries?: ContextEntry[];
}

/**
 * The score type requested/returned for an attribute.
 * Currently, only "PROBABILITY" is supported. Probability scores are in the range [0,1].
 */
export type ScoreType = 'PROBABILITY' | string;

/**
 * Configuration for a requested attribute in an Analyze request.
 *
 * If no options are specified for an attribute, defaults are used, so an
 * empty object {} is valid.
 */
export interface RequestedAttributeConfig {
    /**
     * (optional) The score type to return for this attribute (e.g. "PROBABILITY").
     */
    scoreType?: ScoreType;

    /**
     * (optional) The API won't return scores below this threshold for this attribute.
     * By default all scores are returned.
     */
    scoreThreshold?: number;
}

/**
 * AnalyzeComment request shape.
 *
 * Only `comment.text` and `requestedAttributes` are strictly required by the API.
 */
export interface AnalyzeCommentRequest {
    /** (required) The comment to score. */
    comment: Comment;

    /** (optional) Contextual entries related to the comment. */
    context?: Context;

    /**
     * (required) A map from attribute name (e.g. "TOXICITY") to configuration.
     * If no configuration is needed for an attribute, the value can be {}.
     */
    requestedAttributes: { [attributeName: string]: RequestedAttributeConfig };

    /**
     * (optional) A list of ISO 639-1 two-letter language codes specifying the language(s)
     * that comment is in (for example, "en", "es", "fr", "de", etc). If unspecified, the API
     * will auto-detect the comment language. If language detection fails, the API returns an error.
     */
    languages?: string[];

    /**
     * (optional) Whether the API is permitted to store comment and context from
     * this request. Defaults to false (request data may be stored). Set to true
     * for private data or content written by someone under 13 years old.
     */
    doNotStore?: boolean;

    /** (optional) An opaque token that is echoed back in the response. */
    clientToken?: string;

    /**
     * (optional) An opaque session ID for grouping requests into a single session
     * (used for abuse protection). Should not be a user-specific id.
     */
    sessionId?: string;

    /** (optional) An opaque identifier associating the comment with a community. */
    communityId?: string;

    /**
     * (optional) If true, the response includes span annotations that describe
     * per-span scores (commonly per-sentence). Defaults to false.
     */
    spanAnnotations?: boolean;
}

/**
 * A single numeric score returned by the API for an attribute or span.
 */
export interface Score {
    /** The numeric score value (e.g. a probability in [0,1]). */
    value: number;

    /** (optional) The score type (mirrors requested scoreType). */
    type?: ScoreType;
}

/**
 * A span-level score that applies to a substring of the original comment.
 * begin is the inclusive start character index; end is the exclusive end index.
 */
export interface SpanScore {
    begin: number;
    end: number;
    score: Score;
}

/**
 * Per-attribute scores returned by the API, including an overall summary and
 * optional per-span scores.
 */
export interface AttributeScore {
    /** Summary score for the entire comment (may be omitted if threshold filters it out). */
    summaryScore?: Score;

    /** Optional list of span scores for this attribute. */
    spanScores?: SpanScore[];
}

/**
 * AnalyzeComment response shape.
 */
export interface AnalyzeCommentResponse {
    /**
     * A map from attribute name to AttributeScore. Attribute names mirror the
     * requestedAttributes in the request (e.g. "TOXICITY").
     */
    attributeScores?: { [attributeName: string]: AttributeScore };

    /** Mirrors the request's languages, or the auto-detected language(s) if none specified. */
    languages?: string[];

    /** Mirrors the request's clientToken if provided. */
    clientToken?: string;
}

/**
 * Request shape for suggesting a comment score (feedback endpoint).
 * This lets clients suggest the score they believe is correct for a comment.
 */
export interface SuggestCommentScoreRequest {
    /** (required) The comment being suggested for scoring. */
    comment: Comment;

    /** Optional context entries (same as AnalyzeCommentRequest.context). */
    context?: Context;

    /**
     * (required) The attribute scores the client believes are correct. This has
     * the same shape as the AnalyzeCommentResponse.attributeScores.
     */
    attributeScores: { [attributeName: string]: AttributeScore };

    /** Optional languages (same as AnalyzeCommentRequest.languages). */
    languages?: string[];

    /** Optional community identifier (same as AnalyzeCommentRequest.communityId). */
    communityId?: string;

    /** Optional opaque token echoed in the response. */
    clientToken?: string;
}

/**
 * SuggestCommentScore response shape (echoes clientToken if provided).
 */
export interface SuggestCommentScoreResponse {
    clientToken?: string;
}

// Convenience export: top-level request/response union types
export type PerspectiveRequest = AnalyzeCommentRequest | SuggestCommentScoreRequest;
export type PerspectiveResponse = AnalyzeCommentResponse | SuggestCommentScoreResponse;
