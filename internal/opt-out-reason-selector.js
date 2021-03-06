import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import 'd2l-inputs/d2l-input-shared-styles.js';
import '../d2l-opt-out-reason.js';
import TranslateBehavior from './translate-behaviour.js';

class OptOutReasonSelector extends mixinBehaviors(TranslateBehavior, PolymerElement) {

	static get is() {
		return 'opt-out-reason-selector';
	}

	static get template() {
		const template = html`
			<style include="d2l-input-styles">
				select {
					@apply --d2l-input;
					appearance: none;
					-moz-appearance: none;
					-webkit-appearance: none;
					background-image: url("data:image/svg+xml,%3Csvg%20width%3D%2242%22%20height%3D%2242%22%20viewBox%3D%220%200%2042%2042%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill%3D%22%23f2f3f5%22%20d%3D%22M0%200h42v42H0z%22%2F%3E%3Cpath%20stroke%3D%22%23d3d9e3%22%20d%3D%22M0%200v42%22%2F%3E%3Cpath%20d%3D%22M14.99%2019.582l4.95%204.95a1.5%201.5%200%200%200%202.122%200l4.95-4.95a1.5%201.5%200%200%200-2.122-2.122L21%2021.35l-3.888-3.89a1.5%201.5%200%200%200-2.12%202.122z%22%20fill%3D%22%23565A5C%22%2F%3E%3C%2Fsvg%3E");
					background-position: right center;
					background-repeat: no-repeat;
					background-size: contain;
					display: block;
					margin-bottom: 1.5rem;
					position: relative;
					width: 80%;
				}

				/* for ie11 - avoid displaying default select arrow */
				select::-ms-expand {
					display: none;
				}

				/* for ie11 - prevent background box from covering select arrow */
				select::-ms-value {
					background-color: transparent;
					color: var(--d2l-input-color);
				}

				:dir(rtl) select {
					background-position: left center;
				}

				/* IE11 and edge */
				:host([dir="rtl"]) select {
					background-position: left center;
				}

				select:hover, select:focus {
					@apply --d2l-input-hover-focus;
				}

				#options {
					display: none;
				}
			</style>
			<select id="selector" on-change="_reasonSelected">
				<option disabled="" value="">[[translate('Feedback.ChooseReason')]]</option>
				<!-- elements generated from [[_reasons]] go here -->
				<option value="Other">[[translate('Feedback.Reason.Other')]]</option>
			</select>
			<div id="options">
				<slot id="options-slot" on-slotchange="_onSlotChanged"></slot>
			</div>
		`;
		template.setAttribute('strip-whitespace', true);
		return template;
	}

	static get properties() {
		return {
			selected: {
				type: String,
				readOnly: true,
				reflectToAttribute: true,
				notify: true,
				value: null
			},
			_reasons: {
				type: Array,
				value: [],
				observer: '_reasonsChanged'
			}
		};
	}

	connectedCallback() {
		super.connectedCallback();
		this._onSlotChanged();
	}

	focus() {
		this.$.selector.focus();
	}

	_onSlotChanged() {
		/* Passing <option> elements directly into a <select> tag with a slot doesn't work.
		 * Instead, pass in <d2l-opt-out-reason> elements, and this component will construct
		 * the options from the passed in options.
		 */

		this.$.selector.selectedIndex = 0;
		let children = this.$['options-slot'].assignedNodes({ flatten: true });

		children = children.filter(child =>
			child &&
			child.tagName === 'D2L-OPT-OUT-REASON' &&
			child.key &&
			child.text
		).map(child => ({
			key: child.key,
			text: child.text
		}));

		if (children.length <= 0) {
			// Use default options if no valid options were provided
			children = [
				{ key: 'PreferOldExperience', text: this.translate('Feedback.Reason.PreferOldExperience') },
				{ key: 'MissingFeature', text: this.translate('Feedback.Reason.MissingFeature') },
				{ key: 'NotReadyForSomethingNew', text: this.translate('Feedback.Reason.NotReadyForSomethingNew') },
				{ key: 'JustCheckingSomething', text: this.translate('Feedback.Reason.JustCheckingSomething') }
			];
		}

		this._reasons = [];
		this._reasons = children;
	}

	_reasonSelected() {
		const selectionIndex = this.$.selector.selectedIndex;
		if (selectionIndex < 1) {
			this._setSelected(null);
			return;
		}

		const selection = this.$.selector.options[selectionIndex];
		if (!selection || !selection.value) {
			this._setSelected(null);
			return;
		}

		this._setSelected(selection.value);
	}

	_reasonsChanged(reasons) {
		// [Workaround] dom-repeat inside a <select> element doesn't work in IE11
		const selectElement = this.$.selector;
		while (selectElement.childNodes.length > 2) {
			selectElement.removeChild(selectElement.childNodes[1]);
		}

		reasons.forEach(reason => {
			const option = document.createElement('option');
			option.value = reason.key;
			option.textContent = reason.text;
			selectElement.insertBefore(option, selectElement.lastChild);
		});
	}

}

customElements.define(OptOutReasonSelector.is, OptOutReasonSelector);
