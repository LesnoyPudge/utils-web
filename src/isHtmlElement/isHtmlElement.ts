


/**
 * Checks if a value is an instance of HTMLElement.
 */
export const isHtmlElement = (v: unknown): v is HTMLElement => {
    return v instanceof HTMLElement;
};