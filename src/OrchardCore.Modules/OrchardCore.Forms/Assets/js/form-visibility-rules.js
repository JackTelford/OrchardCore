window.formVisibilityGroupRules = (function () {
    function initialize(data) {

        const inputElement = getInputByName(data.elementName);
        if (!inputElement) {
            return;
        }

        const widgetContainer = inputElement.closest('.widget');

        if (widgetContainer) {
            // const wasVisible = !widgetContainer.classList.contains('d-none');
            const wasVisible = isElementVisible(widgetContainer);

            widgetContainer.setAttribute('data-original-is-visible', String(wasVisible));
            console.log(`✏️ Captured data-original-is-visible="${wasVisible}"`, widgetContainer);
        }

        processGroups(data, inputElement, widgetContainer, true);
    }

    function processGroups(data, inputElement, widgetContainer, addHandlers) {

        //if (addHandlers) {
        //    // const wasVisible = !widgetContainer.classList.contains('d-none');
        //    const wasVisible = isElementVisible(widgetContainer);

        //    widgetContainer.setAttribute('data-original-is-visible', String(wasVisible));
        //    console.log(`✏️ Captured data-original-is-visible="${wasVisible}"`, widgetContainer);
        //}

        let anyGroupRuleMet = false;

        data.groups.forEach(group => {

            let groupPassed = true;

            group.rules?.forEach(rule => {

                const fieldElement = getInputByName(rule.field);
                if (!fieldElement) {
                    console.warn(`Field element not found: ${rule.field}. Ignoring the bad field.`);
                    return;
                }

                const fieldValue = fieldElement.type === 'checkbox'
                    ? (fieldElement.checked ? "true" : "false")
                    : fieldElement.value;

                if (!validateRule(fieldValue, rule)) {
                    groupPassed = false;
                }

                const fields = document.querySelectorAll('.dynamic-visibility-condition');

                for (let i = 0; i < fields.length; i++) {

                    var field = fields[i];
                    if (field.Name != inputElement.Name) {

                        fields[i].dispatchEvent(new Event('change'));
                        fields[i].dispatchEvent(new Event('keyup'));
                    }
                }

                if (addHandlers) {

                    fieldElement.classList.add('dynamic-visibility-condition');

                    fieldElement.addEventListener('change', (e) => {
                        processGroups(data, inputElement, widgetContainer, false);
                    });

                    fieldElement.addEventListener('keyup', (e) => {
                        processGroups(data, inputElement, widgetContainer, false);
                    });
                }

            });
            anyGroupRuleMet = anyGroupRuleMet || groupPassed;
        });

        if (addHandlers) {
            inputElement.dispatchEvent(new Event('change'));
        }

        // we do not have a data-original-is-visible attribute at the moment you first hit the “Show” logic. In the processGroups
        // Since originalState is null, the restoreOriginalState falls into the “else” branch
        const originalState = widgetContainer.getAttribute('data-original-is-visible');
        console.log('widgetContainer is:', widgetContainer, 'action:', data.action, 'originalState:', originalState);
        if (widgetContainer) {
            if (data.action === 'Show') {
                if (anyGroupRuleMet) {
                    widgetContainer.classList.remove('d-none');
                } else {
                    console.log(`🛠 [${data.elementName}] rules failed → restoreOriginalState`);
                    restoreOriginalState(widgetContainer);
                }
            }
            else if (data.action === 'Hide') {
                if (anyGroupRuleMet) {
                    widgetContainer.classList.add('d-none');
                } else {
                    console.log(`🛠 [${data.elementName}] rules failed → restoreOriginalState`);
                    restoreOriginalState(widgetContainer);
                }
            } else {
                originalState = widgetContainer.getAttribute('data-original-is-visible');

                if (originalState === 'true') {
                    widgetContainer.classList.remove('d-none');
                }
                else if (originalState === 'false') {
                    widgetContainer.classList.add('d-none');
                }
                else {
                    widgetContainer.setAttribute('data-original-is-visible', true);
                    widgetContainer.classList.remove('d-none');
                }
            }
        }
    }

    function restoreOriginalState(container) {
        //  var originalState = container.getAttribute('data-original-is-visible');
        const originalState = container.getAttribute('data-original-is-visible') === 'true';
        console.log('🔄 [restoreOriginalState] originally visible?', originalState, container);

        //if (originalState === 'true') {
        //    container.classList.add('d-none');
        //} else {
        //    container.setAttribute('data-original-is-visible', true);
        //    container.classList.remove('d-none');
        //}

        if (originalState) {
            container.classList.remove('d-none');
        } else {
            container.setAttribute('data-original-is-visible', true);
            container.classList.add('d-none');
        }
    }

    function getInputByName(name) {
        return document.querySelector(`input[name="${name}"],select[name="${name}"],textarea[name="${name}"]`);
    }

    function validateRule(inputValue, rule) {

        if (!rule.operator) {
            console.warn("Rule operator is missing for rule", rule);
            return false;
        }

        var lowerInputValue = inputValue ? inputValue.trim() : "";

        var lowerRuleValue = rule.value ? rule.value.trim() : "";

        switch (rule.operator) {
            case 'Is':
                return lowerInputValue === lowerRuleValue;

            case 'IsNot':
                return lowerInputValue !== lowerRuleValue;

            case 'Contains':
                return lowerInputValue.includes(lowerRuleValue);

            case 'DoesNotContain':
                return !lowerInputValue.includes(lowerRuleValue);

            case 'StartsWith':
                return lowerInputValue.startsWith(lowerRuleValue);

            case 'EndsWith':
                return lowerInputValue.endsWith(lowerRuleValue);

            case 'GreaterThan':
                var numberInputValue = parseFloat(inputValue);
                var numberRuleValue = parseFloat(rule.value);

                if (!isNaN(numberInputValue) && !isNaN(numberRuleValue)) {
                    return numberInputValue > numberRuleValue;
                }
                return inputValue > rule.value;

            case 'LessThan':
                var numberInputValue = parseFloat(inputValue);
                var numberRuleValue = parseFloat(rule.value);

                if (!isNaN(numberInputValue) && !isNaN(numberRuleValue)) {
                    return numberInputValue < numberRuleValue;
                }
                return inputValue < rule.value;

            case 'Empty':
                return lowerInputValue === "";

            case 'NotEmpty':
                return lowerInputValue !== "";

            default:
                console.warn(`validateRule: Unknown operator "${rule.operator}" in rule`, rule);
                return false;
        }
    }

    function isElementVisible(el) {
        if (!el) return false;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    return {
        initialize: initialize
    };

})();
