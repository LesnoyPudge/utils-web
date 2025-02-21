
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { autoBind, invariant, ListenerStore } from '@lesnoypudge/utils';



type FocusCallback = (element: Element) => void;
type BlurCallback = (e: FocusEvent) => void;

const INPUT_TYPES_ALLOWLIST: Record<string, boolean> = {
    'text': true,
    'search': true,
    'url': true,
    'tel': true,
    'email': true,
    'password': true,
    'number': true,
    'date': true,
    'month': true,
    'week': true,
    'time': true,
    'datetime': true,
    'datetime-local': true,
};

/**
 * Based on https://github.com/WICG/focus-visible
 */
export class FocusVisibleManager {
    private isActive: boolean;
    private hadKeyboardEvent: boolean;
    private hadFocusVisibleRecently: boolean;
    private hadFocusVisibleRecentlyTimeout: number | undefined;
    private scope: ((Document | ShadowRoot) & { host?: Element }) | undefined;
    private currentFocusVisibleElement: Element | null;
    private focusListeners: ListenerStore<'focus', Parameters<FocusCallback>>;
    private blurListeners: ListenerStore<'blur', Parameters<BlurCallback>>;
    private cleanup: VoidFunction | null;

    constructor() {
        this.isActive = false;
        this.hadKeyboardEvent = true;
        this.hadFocusVisibleRecently = false;
        this.hadFocusVisibleRecentlyTimeout = undefined;
        this.currentFocusVisibleElement = null;
        this.focusListeners = new ListenerStore();
        this.blurListeners = new ListenerStore();
        this.cleanup = null;

        autoBind(this);
    }

    start() {
        if (this.isActive) return;
        if (typeof document === 'undefined') return;

        this.isActive = true;

        // Apply the polyfill to the global document, so that no JavaScript
        // coordination is required to use the polyfill in the
        // top-level document:
        this.cleanup = this.applyFocusVisiblePolyfill(document);
    }

    stop() {
        if (!this.isActive) return;

        this.isActive = false;

        invariant(this.cleanup);
        this.cleanup();
    }

    clean() {
        this.blurListeners.removeAll();
        this.focusListeners.removeAll();
        this.stop();
    }

    getCurrentElement() {
        return this.currentFocusVisibleElement;
    }

    isFocusVisible(el: Element | Node | EventTarget | null) {
        if (!el) return false;

        return el === this.currentFocusVisibleElement;
    }

    onIn(callback: FocusCallback) {
        return this.focusListeners.add('focus', callback);
    }

    onOut(callback: BlurCallback) {
        return this.blurListeners.add('blur', callback);
    }

    /**
     * Applies the :focus-visible polyfill at the given scope.
     * A scope in this case is either the top-level Document or a Shadow Root.
     *
     * @see https://github.com/WICG/focus-visible
     */
    private applyFocusVisiblePolyfill(scope: NonNullable<typeof this.scope>) {
        this.scope = scope;

        // For some kinds of state, we are interested in changes
        // at the global scope only. For example, global pointer
        // input, global key presses and global visibility change
        // should affect the state at every scope:
        document.addEventListener('keydown', this.onKeyDown, true);
        document.addEventListener('mousedown', this.onPointerDown, true);
        document.addEventListener('pointerdown', this.onPointerDown, true);
        document.addEventListener('touchstart', this.onPointerDown, true);
        document.addEventListener(
            'visibilitychange',
            this.onVisibilityChange,
            true,
        );

        this.addInitialPointerMoveListeners();

        // For focus and blur, we specifically care about state
        // changes in the local scope. This is because focus / blur
        // events that originate from within a shadow root are
        // not re-dispatched from the host element if it was already
        // the active element in its own scope:
        scope.addEventListener('focus', this.onFocus, true);
        scope.addEventListener(
            'blur', this.onBlur as EventListenerOrEventListenerObject, true,
        );

        return () => {
            document.removeEventListener(
                'keydown', this.onKeyDown, true,
            );
            document.removeEventListener(
                'mousedown', this.onPointerDown, true,
            );
            document.removeEventListener(
                'pointerdown', this.onPointerDown, true,
            );
            document.removeEventListener(
                'touchstart', this.onPointerDown, true,
            );
            document.removeEventListener(
                'visibilitychange', this.onVisibilityChange, true,
            );

            scope.removeEventListener('focus', this.onFocus, true);
            scope.removeEventListener(
                'blur', this.onBlur as EventListenerOrEventListenerObject, true,
            );

            this.removeInitialPointerMoveListeners();

            window.clearTimeout(this.hadFocusVisibleRecentlyTimeout);
        };
    }

    /**
     * Helper function for legacy browsers and iframes which sometimes focus
     * elements like document, body, and non-interactive SVG.
     */
    isValidFocusTarget(el: any): el is Element {
        if (
            el
            && el !== document
            && el.nodeName !== 'HTML'
            && el.nodeName !== 'BODY'
            && 'classList' in el
            && 'contains' in el.classList
        ) return true;

        return false;
    }

    /**
     * Computes whether the given element should automatically trigger the
     * `focus-visible` class being added, i.e. whether it should always match
     * `:focus-visible` when focused.
     */
    private focusTriggersKeyboardModality(el: any): boolean {
        let type = el.type;
        let tagName = el.tagName;

        if (
            tagName === 'INPUT'
            && INPUT_TYPES_ALLOWLIST[type]
            && !el.readOnly
        ) {
            return true;
        }

        if (tagName === 'TEXTAREA' && !el.readOnly) {
            return true;
        }

        if (el.isContentEditable) {
            return true;
        }

        return false;
    }

    /**
     * Add the `focus-visible` class to the given element if it was not added by
     * the author.
     */
    private addFocusVisibleClass(el: Element) {
        if (this.currentFocusVisibleElement === el) return;

        this.currentFocusVisibleElement = el;

        this.focusListeners.trigger('focus', el);
    }

    /**
     * Remove the `focus-visible` class from the given element if it was not
     * originally added by the author.
     */
    private removeFocusVisibleClass(e: FocusEvent) {
        const el = e.target;
        if (!el) return;

        if (this.currentFocusVisibleElement !== el) return;

        this.currentFocusVisibleElement = null;

        this.blurListeners.trigger('blur', e);
    }

    /**
     * If the most recent user interaction was via the keyboard;
     * and the key press did not include a meta, alt/option, or control key;
     * then the modality is keyboard. Otherwise, the modality is not keyboard.
     * Apply `focus-visible` to any current active element and keep track
     * of our keyboard modality state with `hadKeyboardEvent`.
     */
    private onKeyDown(e: KeyboardEvent) {
        if (e.metaKey || e.altKey || e.ctrlKey) return;

        invariant(this.scope);

        if (this.isValidFocusTarget(this.scope.activeElement)) {
            this.addFocusVisibleClass(this.scope.activeElement);
        }

        this.hadKeyboardEvent = true;
    }

    /**
     * If at any point a user clicks with a pointing device,
     * ensure that we change the modality away from keyboard.
     * This avoids the situation where a user presses a key
     * on an already focused element, and then clicks on
     * a different element, focusing it with a pointing device,
     * while we still think we're in keyboard modality.
     */
    private onPointerDown() {
        this.hadKeyboardEvent = false;
    }

    /**
     * On `focus`, add the `focus-visible` class to the target if:
     * - the target received focus as a result of keyboard navigation, or
     * - the event target is an element that will likely require interaction
     *   via the keyboard (e.g. a text box)
     */
    private onFocus(e: Event) {
        // Prevent IE from focusing the document or HTML element.
        if (!this.isValidFocusTarget(e.target)) return;

        if (
            this.hadKeyboardEvent
            || this.focusTriggersKeyboardModality(e.target)
        ) {
            this.addFocusVisibleClass(e.target);
        }
    }

    /**
     * On `blur`, remove the `focus-visible` class from the target.
     */
    private onBlur(e: FocusEvent) {
        if (!this.isValidFocusTarget(e.target)) return;

        if (this.isFocusVisible(e.target)) {
            // To detect a tab/window switch, we look for a blur
            // event followed rapidly by a visibility change.
            // If we don't see a visibility change within 100ms,
            // it's probably a regular focus change.
            this.hadFocusVisibleRecently = true;

            window.clearTimeout(this.hadFocusVisibleRecentlyTimeout);

            this.hadFocusVisibleRecentlyTimeout = window.setTimeout(() => {
                this.hadFocusVisibleRecently = false;
            }, 100);

            this.removeFocusVisibleClass(e);
        }
    }

    /**
     * If the user changes tabs, keep track of whether or not the previously
     * focused element had .focus-visible.
     */
    private onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            // If the tab becomes active again, the browser
            // will handle calling focus on the element (Safari
            // actually calls it twice).
            // If this tab change caused a blur on an element
            // with focus-visible, re-apply the class when the
            // user switches back to the tab.
            if (this.hadFocusVisibleRecently) {
                this.hadKeyboardEvent = true;
            }

            this.addInitialPointerMoveListeners();
        }
    }

    /**
     * Add a group of listeners to detect usage of any pointing devices.
     * These listeners will be added when the polyfill first loads, and anytime
     * the window is blurred, so that they are active when the window regains
     * focus.
     */
    private addInitialPointerMoveListeners() {
        document.addEventListener('mousemove', this.onInitialPointerMove);
        document.addEventListener('mousedown', this.onInitialPointerMove);
        document.addEventListener('mouseup', this.onInitialPointerMove);
        document.addEventListener('pointermove', this.onInitialPointerMove);
        document.addEventListener('pointerdown', this.onInitialPointerMove);
        document.addEventListener('pointerup', this.onInitialPointerMove);
        document.addEventListener('touchmove', this.onInitialPointerMove);
        document.addEventListener('touchstart', this.onInitialPointerMove);
        document.addEventListener('touchend', this.onInitialPointerMove);
    }

    private removeInitialPointerMoveListeners() {
        document.removeEventListener('mousemove', this.onInitialPointerMove);
        document.removeEventListener('mousedown', this.onInitialPointerMove);
        document.removeEventListener('mouseup', this.onInitialPointerMove);
        document.removeEventListener('pointermove', this.onInitialPointerMove);
        document.removeEventListener('pointerdown', this.onInitialPointerMove);
        document.removeEventListener('pointerup', this.onInitialPointerMove);
        document.removeEventListener('touchmove', this.onInitialPointerMove);
        document.removeEventListener('touchstart', this.onInitialPointerMove);
        document.removeEventListener('touchend', this.onInitialPointerMove);
    }

    /**
     * When the polfyill first loads, assume the user is in keyboard modality.
     * If any event is received from a pointing device (e.g. mouse, pointer,
     * touch), turn off keyboard modality.
     * This accounts for situations where focus enters the page from
     * the URL bar.
     */
    private onInitialPointerMove(e: Event) {
        // Work around a Safari quirk that fires a mousemove on
        // <html> whenever the window blurs, even if you're
        // tabbing out of the page. ¯\_(ツ)_/¯
        if (
            e.target
            && 'nodeName' in e.target
            && typeof e.target.nodeName === 'string'
            && e.target.nodeName.toLowerCase?.() === 'html'
        ) return;

        this.hadKeyboardEvent = false;
        this.removeInitialPointerMoveListeners();
    }
}

/**
 * Based on https://github.com/WICG/focus-visible
 */
export const focusVisibleManager = new FocusVisibleManager();