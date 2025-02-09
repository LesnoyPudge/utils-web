import { isHtmlElement } from '@root/isHtmlElement';



const fallback = (text: string) => {
    const previousFocusElement = document.activeElement;
    const textArea = document.createElement('textarea');

    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.visibility = 'hidden';

    document.body.append(textArea);
    textArea.focus();
    textArea.select();
    console.log(document);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand('copy');
    textArea.remove();

    if (isHtmlElement(previousFocusElement)) {
        previousFocusElement.focus();
    }
};

/**
 * Copies the given text to the clipboard, using a fallback if
 * the Clipboard API is unavailable.
 */
export const copyToClipboard = (text: string) => {
    if (!navigator.clipboard) return fallback(text);

    navigator.clipboard.writeText(text).catch(() => fallback(text));
};