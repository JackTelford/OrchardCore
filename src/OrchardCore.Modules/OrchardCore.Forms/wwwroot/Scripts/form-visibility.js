window.formVisibilityGroups=function(){let e={template:`
        <div class="mb-3">
            <!-- Loop through each group -->
            <div class="card mb-1" v-for="(group, groupIndex) in groups" :key="groupIndex">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>Group {{ groupIndex + 1 }}</span>
                    <input type="hidden" :name="prefix + 'Groups[' + groupIndex + '].IsRemoved'" value="false" />
                    <button type="button" class="btn btn-sm btn-danger" @click="removeGroup(groupIndex)">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                        
                <div class="card-body">

                    <!-- Loop through each rule -->
                    <ul class="list-group w-100">
                        <!-- Loop through each rule in the group -->
                        <li class="list-group-item" v-for="(rule, ruleIndex) in group.rules" :key="ruleIndex">
                            <div class="row">
                                <div class="col">
                                    <select class="form-select" v-model="rule.field" :name="prefix + 'Groups[' + groupIndex + '].Rules[' + ruleIndex + '].Field'">
                                        <option value="">Select Field</option>
                                    <option v-for="option in filteredFieldOptions(rule.field)" :value="option.value">
                                        {{ option.text }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col" :class="{'d-none': !rule.field}">
                                    <select class="form-select" v-model="rule.operator"
                                    :name="prefix + 'Groups[' + groupIndex + '].Rules[' + ruleIndex + '].Operator'">
                                        <option value="">Select Operator</option>
                                        <option v-for="option in operatorsList(rule.field)" :value="option.value">
                                            {{ option.text }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col" :class="{'d-none': !shouldShowValue(rule.operator)}">
                                    <input type="text" class="form-control" v-model="rule.value" placeholder="Value" :name="prefix + 'Groups[' + groupIndex + '].Rules[' + ruleIndex + '].Value'" />
                                </div>
                                <div class="col-auto d-flex align-items-center" :class="{'d-none': !shouldShowValue(rule.operator)}">
                                    <input type="checkbox" class="form-check-input" v-model="rule.caseSensitive" :name="prefix + 'Groups[' + groupIndex + '].Rules[' + ruleIndex + '].CaseSensitive'" :value="true" :false-value="false" />
                                    <label class="form-check-label ms-2" :for="prefix + 'Groups[' + groupIndex + '].Rules[' + ruleIndex + '].CaseSensitive'"> Case sensitive </label>
                                </div>
                                <div class="col-auto">
                                    <input type="hidden" :name="prefix + 'Groups[' + groupIndex + '].Rules[' + ruleIndex + '].IsRemoved'" value="false" />
                                    <button type="button" class="btn btn-sm btn-danger" @click="removeRule(groupIndex, ruleIndex)">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </li>
  
                    </ul>
                </div>

                <div class="card-footer">
                    <div class="d-flex justify-content-end">
                        <button type="button" class="btn btn-sm btn-primary" @click="addRule(groupIndex)">
                            <i class="fa-solid fa-plus"></i> New Rule
                        </button>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end p-3">
                <button type="button" class="btn btn-sm btn-primary" @click="addGroup()">
                    <i class="fa-solid fa-circle-plus"></i> New Group
                </button>
            </div>
        </div>
        `};return{initialize:t=>{let s=Object.assign({},e,t);if(!s.appElementSelector){console.error("appElementSelector is required");return}return new Vue({el:s.appElementSelector,data:()=>({groups:s.groupOptions||[],fieldOptions:s.FieldOptions||[],operatorOptions:s.operatorOptions||[],allOperatorOptions:s.operatorOptions||[],caseSensitive:s.caseSensitive,prefix:"",widgetId:s.widgetId,preloadedOptions:[]}),methods:{addGroup(){var e={rules:[{field:"",operator:"",value:"",caseSensitive:this.caseSensitive}]};this.groups.push(e),this.$set(this.groups,this.groups.length-1,e)},addRule(e){let t={field:"",operator:"",value:"",caseSensitive:this.caseSensitive};this.$set(this.groups[e].rules,this.groups[e].rules.length,t)},removeGroup(e){this.groups.splice(e,1)},removeRule(e,t){this.groups[e].rules.splice(t,1)},populateFields(){let e=this.getInputs(document);this.fieldOptions=e.map(function(e){return{value:e.htmlName,text:e.htmlName,type:e.htmlInputType}})},getInputs(e){let t=e.querySelectorAll(".widget-template"),s=[];return t.forEach(function(e){let t=e.querySelector('input[name$="FormInputElementPart.Name"]');if(t){let o=t.value.trim(),i="text",r=e.querySelector('select[name$="InputPart.Type"], select[name$="SelectPart.Editor"]');if(r&&(i=r.options[r.selectedIndex].value.toLowerCase()),!o||!i)return;s.push({htmlName:o,htmlInputType:i})}}),s},filteredFieldOptions(){let e=this.$el.closest(".widget-template");if(!e)return this.fieldOptions;let t=e.querySelector('input[name$="FormInputElementPart.Name"]')?.value.trim()||"";if(!t)return this.fieldOptions;let s=new Set;return this.fieldOptions.filter(e=>{let o=String(e.value||"").trim();return!(o===t||s.has(o))&&(s.add(o),!0)})},operatorsList(e){let t=this.fieldOptions.find(t=>t.value===e);if(!t)return[];let s=this.operatorMapping();return s[t.type]?this.allOperatorOptions.filter(e=>s[t.type].includes(e.value)):[]},operatorMapping:()=>({radio:["Is","IsNot","Empty","NotEmpty","Contains","DoesNotContain","StartsWith","EndsWith"],checkbox:["Is","IsNot","Contains","DoesNotContain"],text:["Is","IsNot","Empty","NotEmpty","Contains","DoesNotContain","StartsWith","EndsWith"],number:["Is","IsNot","GreaterThan","LessThan"],email:["Is","IsNot","Empty","NotEmpty"],tel:["Is","IsNot"],date:["Is","IsNot","GreaterThan","LessThan"],time:["Is","IsNot","GreaterThan","LessThan"],datetime:["Is","IsNot","GreaterThan","LessThan"],"datetime-local":["Is","IsNot","GreaterThan","LessThan"],month:["Is","IsNot"],week:["Is","IsNot"],hidden:["Is","IsNot"],password:["Is","IsNot","Empty","NotEmpty"],color:["Is","IsNot"],range:["Is","IsNot","GreaterThan","LessThan"],file:["Is","IsNot"],url:["Is","IsNot","Contains"],image:["Is","IsNot"],reset:["Is","IsNot"],search:["Is","IsNot","Contains"],dropdown:["Is","IsNot","Empty","NotEmpty","Contains","DoesNotContain","StartsWith","EndsWith"],textarea:["Is","IsNot","Empty","NotEmpty","Contains","DoesNotContain","StartsWith","EndsWith"],submit:[]}),toggleTabEvent(){document.addEventListener("shown.bs.tab",e=>{if(e.target.matches('[data-bs-toggle="tab"]')){var t=e.target.closest(".content-part-wrapper-form-part"),s=this.getInputs(t||document);this.fieldOptions=s.map(e=>({value:e.htmlName,text:e.htmlName,type:e.htmlInputType}))}})},shouldShowValue:e=>!!e&&"Empty"!==e&&"NotEmpty"!==e},mounted(){s.prefix&&(this.prefix=s.prefix+"."),this.toggleTabEvent(),this.groups=s.groupOptions||[],this.operatorOptions=s.operatorOptions||[],this.allOperatorOptions=s.operatorOptions||[],this.populateFields(),new MutationObserver(e=>{e.forEach(e=>{"childList"===e.type&&e.addedNodes.length&&(this.preloadedOptions=this.filteredFieldOptions())})}).observe(this.$el,{childList:!0,subtree:!0})},template:s.template})}}}();
//# sourceMappingURL=form-visibility.map