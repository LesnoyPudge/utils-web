import { removeEventListener } from '@root';



export namespace addEventListener {
    export type ElementUnion = HTMLElement | Document | Window;

    export type AvailableEventNames<ProvidedElement extends ElementUnion> = (
        ProvidedElement extends Document
            ? DocumentEventMap
            : ProvidedElement extends Window
                ? WindowEventMap
                : ProvidedElement extends HTMLElement
                    ? HTMLElementEventMap
                    : never
    );
}

type AddEventListener = <
    ProvidedElement extends addEventListener.ElementUnion,
    EventName extends keyof addEventListener.AvailableEventNames<
        ProvidedElement
    >,
>(
    element: ProvidedElement,
    eventName: EventName,
    fn: (e: addEventListener.AvailableEventNames<
        ProvidedElement
    >[EventName]) => void,
    options?: AddEventListenerOptions,
) => () => void;

export const addEventListener: AddEventListener = (
    element,
    eventName,
    fn,
    options,
) => {
    element.addEventListener(String(eventName), fn as EventListener, options);

    return () => removeEventListener(element, eventName, fn);
};