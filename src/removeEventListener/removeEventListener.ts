


type ElementUnion = HTMLElement | Document | Window;

type AvailableEventNames<ProvidedElement extends ElementUnion> = (
    ProvidedElement extends Document
        ? DocumentEventMap
        : ProvidedElement extends Window
            ? WindowEventMap
            : ProvidedElement extends HTMLElement
                ? HTMLElementEventMap
                : never
);

type RemoveEventListener = <
    ProvidedElement extends ElementUnion,
    EventName extends keyof AvailableEventNames<ProvidedElement>,
>(
    element: ProvidedElement,
    eventName: EventName,
    fn: (e: AvailableEventNames<ProvidedElement>[EventName]) => void
) => void;

export const removeEventListener: RemoveEventListener = (
    element,
    eventName,
    fn,
) => {
    element.removeEventListener(String(eventName), fn as EventListener);
};