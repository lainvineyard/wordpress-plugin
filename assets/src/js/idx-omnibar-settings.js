window.addEventListener('DOMContentLoaded', function(){

    if(typeof loadOmnibarView !== 'undefined'){
        jQuery.post(
            ajaxurl, {
            'action': 'idx_preload_omnibar_settings_view'
            }, function(){window.location.reload();}
        );
    }

    var saveButton = document.querySelectorAll('#save_changes')[0];
    var ajax_load = "<span class='ajax'></span>";
    var mlsPts = document.querySelectorAll('.omnibar-mlsPtID');
    var customField = document.querySelectorAll('.omnibar-additional-custom-field')[0];
    var errorMessage = document.querySelectorAll('.customFieldError')[0];

    (function construct() {
        activateSelect2();
        initializeSaveButton();
        //only show relevant fields for property types selected on load
        updateCustomFields();
        //update whenever the Pts are changed
        listenForPtChange();
        listenForCustomFieldChange();
    })();

    //helper function for iteration
    function forEach(array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, array[i], i);
        }
    }

    function activateSelect2() {
        jQuery('.select2').select2({
            maximumSelectionLength: 10,
            placeholder: 'Select Up to Ten Fields'
        });
    }
    
    function initializeSaveButton() {
        if(typeof saveButton !== 'undefined'){
            saveButton.addEventListener('click', function(event){
            event.preventDefault();
            jQuery('.status').fadeIn('fast').html(ajax_load + 'Saving Settings...');
            updateOmnibarCurrentCcz();
            });
        }
    }

    function listenForPtChange() {
        forEach(mlsPts, function(value){
            value.addEventListener('change', updateCustomFields);
        });
    }

    function listenForCustomFieldChange() {
        jQuery(customField).on('change', invalidFieldCheck);
    }

    function updateCustomFields(){
        forEach(mlsPts, function(value){
            var idxID = value.name;
            var pt = value.value;
            if(idxID === 'basic'){
                return;
            }
            hideIrrelevantFields(idxID, pt);
        });
        return invalidFieldCheck();
    }

    function hideIrrelevantFields(idxID, pt){
        var mls = customField.querySelectorAll('.' + idxID)[0];
        var fields = mls.querySelectorAll('option');
        //for each MLS
        forEach(fields, function(value){
            if(value.getAttribute('data-mlsptid') !== pt){
                value.disabled = true;
            } else {
                value.disabled = false;
            }
        });
        return refreshSelect2(customField);
    }

    function refreshSelect2(el){
        jQuery(el).select2('destroy');
        return jQuery(el).select2();
    }

    function invalidFieldCheck()
    {
        removeErrors();
        var selected = customField.selectedOptions;
        forEach(selected, function(value){
            try {
                if(value.disabled === true){
                    throw value;
                }
            } catch(option) {
                customFieldError(option.title);
            }
        });
    }

    function removeErrors()
    {
        errorMessage.style.display = 'none';
        errorMessage.querySelector('p').innerHTML = '';
    }

    function customFieldError(optionName)
    {
        var message = optionName + ' is not a Custom Field in the selected property type for this MLS. Please choose a different Custom Field from within the selected MLS Specific Property Type.<br>';
        errorMessage.querySelector('p').insertAdjacentHTML('beforeend', message);
        errorMessage.style.display = 'block';
    }

    function updateOmnibarCurrentCcz(){
        if(typeof document.querySelectorAll('.city-list')[0] === 'undefined'){
            return;
        }
        var city = jQuery('.city-list select').val();
        var county = jQuery('.county-list select').val();
        var zipcode = jQuery('.zipcode-list select').val();
         jQuery.post(
                ajaxurl, {
                'action': 'idx_update_omnibar_current_ccz',
                'city-list': city,
                'county-list': county,
                'zipcode-list': zipcode
        }, function(){updateOmnibarCustomFields();});
    }


    function updateOmnibarCustomFields(){
        if(customField.options === undefined){
            return;
        }
        var customFieldValues = [];
        for (var i = 0; i < customField.options.length; i++) {
            if(customField.options[i].selected){
                var idxID = customField.options[i].parentNode.classList[0];
                var value = customField.options[i].value;
                var fieldName = customField.options[i].label;
                var mlsPtID = customField.options[i].getAttribute('data-mlsptid');
                var fieldObject = {'idxID': idxID, 'value': value, 'mlsPtID': mlsPtID, 'name': fieldName};
                customFieldValues.push(fieldObject);
            }
        }
        var mlsPtIDs = [];
        for (var i = 0; i < mlsPts.length; i++) {
                var idxID = mlsPts[i].name;
                var value = mlsPts[i].value;
                var mlsPtObject = {'idxID': idxID, 'mlsPtID': value};
                mlsPtIDs.push(mlsPtObject);
        }
        var placeholder = document.querySelectorAll('.omnibar-placeholder')[0].value;
         jQuery.post(
                ajaxurl, {
                'action': 'idx_update_omnibar_custom_fields',
                'fields': customFieldValues,
                'mlsPtIDs': mlsPtIDs,
                'placeholder': placeholder
        }, function(){window.location.reload();});
    }
});
