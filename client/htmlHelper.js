/* globals $ */
exports.initialize = function (regexHelper) {
  'use strict';
  const verticalTabCharacter = String.fromCharCode(11),
    nullCharacter = String.fromCharCode(0),
    comma = '","',
    carriageReturn = '"\r\n"',
    getClickOrTouchStart = function () {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      return isTouchDevice ? 'touchstart' : 'click';
    },
    setClick = function (target, data, callback) {
      const clickMethod = getClickOrTouchStart();
      target.off(clickMethod);
      if (data) {
        target.on(clickMethod, data, callback);
        return;
      }
      target.on(clickMethod, callback);
    },
    unsetClick = function (target) {
      const clickMethod = getClickOrTouchStart();
      target.off(clickMethod);
    },
    createOptionBase = function (value, title, className) {
      var option = $('<option/>');
      option.val(value);
      if (title) {
        option.attr('title', title);
      }
      if (className) {
        option.addClass(className);
      }
      return option;
    },
    createImageLink = function (url, imageSource, title, wantNewTab, className) {
      var link, image;
      if (!regexHelper.isValidUrl(url)) {
        return null;
      }
      link = $('<a>').attr('href', url);
      if (wantNewTab) {
        link.attr('target', '_blank');
      }
      if (className) {
        link.addClass(className);
      }
      image = $('<img>').attr({ src: imageSource, title: title });
      link.append(image);
      return link;
    },
    createLink = function (url, title, text, wantNewTab) {
      var link;
      if (!regexHelper.isValidUrl(url)) {
        return null;
      }
      link = $('<a>').attr('href', url);
      if (title) {
        link.attr('title', title);
      }
      if (text) {
        link.text(text);
      }
      if (wantNewTab) {
        link.attr('target', '_blank');
      }
      return link;
    },
    createMailToImageLink = function () {
      var mailToLink, emailImage, emailAddress, imageSource;
      mailToLink = $('<a>').attr('href', 'mailto:' + emailAddress);
      emailImage = $('<img>').attr('src', imageSource);
      mailToLink.append(emailImage);
      return mailToLink;
    },
    getOptionValueFromText = function (select, text) {
      var value = 'not found';
      select.find('option').each(function () {
        if ($(this).text() === text) {
          value = $(this).val();
        }
      });
      return value;
    },
    getSelectedOptionText = function (select) {
      return select.find('option:selected').text();
    },
    createOption = function (text, value, title, className) {
      var option = createOptionBase(value, title, className);
      option.text(text);
      return option;
    },
    createSelect = function (id, selectMessage, emptyOptionText) {
      const select = $('<select>');
      if (id) {
        select.attr('id', id);
      }
      initializeSelect(select, selectMessage, emptyOptionText);
      return select;
    },
    initializeSelect = function (select, selectMessage, emptyOptionText, value) {
      select.empty();
      select.append(createOption(emptyOptionText || '<select>', value || emptyOptionText, selectMessage));
      select.attr('title', selectMessage);
    },
    fillSelectFromList = function (select, selectMessage, list, emptyOptionText) {
      initializeSelect(select, selectMessage, emptyOptionText);
      list.forEach(function (element) {
        select.append(createOption(element, element));
      });
    },
    fillSelectFromKeyValuePairs = function (select, selectMessage, keyValuePairs, emptyOptionText, keyPropertyName, valuePropertyName, newOptionPosition) {
      keyPropertyName = keyPropertyName || 'Key';
      valuePropertyName = valuePropertyName || 'Value';
      initializeSelect(select, selectMessage, emptyOptionText);
      if (newOptionPosition && newOptionPosition === 'top') {
        select.append(createOption('<new>', 'new'));
      }
      keyValuePairs.forEach(function (element) {
        select.append(createOption(element[valuePropertyName], element[keyPropertyName]));
      });
      if (newOptionPosition && newOptionPosition === 'bottom') {
        select.append(createOption('<new>', 'new'));
      }
    },
    display = function (displayControl, message, isError, errorClassname, successClassname) {
      displayControl.text('');
      displayControl.text(message);
      displayControl.removeClass(errorClassname);
      displayControl.removeClass(successClassname);
      displayControl.addClass(isError ? errorClassname : successClassname);
    },
    initializeCheckboxInput = function (input, className, isChecked, id) {
      input.attr('type', 'checkbox');
      if (id) {
        input.attre('id', id);
      }
      if (className) {
        input.addClass(className);
      }
      input.prop('checked', isChecked);
      return input;
    },
    initializeInput = function (type, input, width, text, maxlength, className, placeholder, id) {
      input.attr('type', type);
      if (width) {
        input.css('width', width + 'px');
      }
      if (text) {
        input.val(text);
      }
      if (maxlength) {
        input.attr('maxlength', maxlength);
      }
      if (className) {
        input.addClass(className);
      }
      if (placeholder) {
        input.attr('placeholder', placeholder);
      }
      if (id) {
        input.attr('id', id);
      }
      return input;
    },
    createFileInput = function (width, text, maxlength, className, placeholder, id) {
      return initializeInput('file', $('<input>'), width, text, maxlength, className, placeholder, id);
    },
    createTextInput = function (width, text, maxlength, className, placeholder, id) {
      return initializeInput('text', $('<input>'), width, text, maxlength, className, placeholder, id);
    },
    createCheckboxInput = function (className, isChecked, id) {
      return initializeCheckboxInput($('<input>'), className, isChecked, id);
    },
    createNumericInput = function (width, text, maxlength, className, placeholder, id) {
      var input = createTextInput(width, text, maxlength, className, placeholder, id);
      input.keypress((e) => isNumericKey(e));
      return input;
    },
    createFixedColumnsTable = function (data, cellsPerRow, className, cellClick) {
      var i, k, item, row, cell, table, length, remainder, emptyRows;
      table = $('<table/>');
      if (className) {
        table.addClass(className);
      }
      if (!data || data.length === 0) {
        return table;
      }
      length = data.length;
      remainder = length % cellsPerRow;
      emptyRows = remainder === 0 ? 0 : cellsPerRow - remainder;
      for (i = 0; i < length; i += 1) {
        item = data[i];
        if (i === 0 || i % cellsPerRow === 0) {
          row = $('<tr/>');
          table.append(row);
        }
        cell = $('<td/>');
        cell.append(item);
        if (cellClick) {
          setClick(cell, cellClick);
        }
        if (row) {
          row.append(cell);
        }
      }
      for (k = 0; k < emptyRows; k += 1) {
        cell = $('<td/>');
        if (row) {
          row.append(cell);
        }
      }
      return table;
    },
    createSpan = function (text, className) {
      const span = $('<span>');
      if (className) {
        span.addClass(className);
      }
      span.text(text);
      return span;
    },
    createContainer = function (className, id) {
      const div = $('<div>');
      if (className) {
        div.addClass(className);
      }
      if (id) {
        div.attr('id', id);
      }
      return div;
    },
    createTextArea = function (text, className, rows) {
      const textarea = $('<textarea>');
      if (className) {
        textarea.addClass(className);
      }
      if (rows) {
        textarea.attr('rows', rows);
      }
      textarea.text(text);
      return textarea;
    },
    createTable = function (className) {
      var table = $('<table>');
      if (className) {
        table.addClass(className);
      }
      return table;
    },
    createImage = function (src, clickFunction, width, className) {
      var image = $('<img>');
      image.css('cursor', 'pointer');
      if (className) {
        image.addClass(className);
      }
      if (width) {
        image.css('width', width + 'px');
      }
      image.attr('src', src);
      setClick(image, clickFunction);
      return image;
    },
    createRow = function (className) {
      var row = $('<tr>');
      if (className) {
        row.addClass(className);
      }
      return row;
    },
    createCell = function (width, text, isHeader, className) {
      var cell = isHeader ? $('<th>') : $('<td>');
      if (width) {
        cell.css('width', width + 'px');
      }
      if (text) {
        cell.text(text);
      }
      if (width === 0) {
        cell.hide();
      }
      if (className) {
        cell.addClass(className);
      }
      return cell;
    },
    appendCell = function (row, text, width, isHeader, className) {
      var cell = createCell(width, text, isHeader, className);
      row.append(cell);
      return cell;
    },
    exportTableToCSV = function (table, includeClassName) {
      var rows, cols, csv, text, selector;
      selector = includeClassName ? 'td.' + includeClassName : 'td';
      rows = $(table).find('tr:has(td)');
      csv = '"' + rows.map(function (i, row) {
        cols = $(row).find(selector);
        return cols.map(function (j, col) {
          text = $(col).text();
          return text.replace('"', '""');
        }).get().join(verticalTabCharacter);
      }).get().join(nullCharacter)
        .split(nullCharacter).join(carriageReturn)
        .split(verticalTabCharacter).join(comma) + '"';
      return csv;
    },
    copyToClipboard = async function (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error(error.message);
      }
    },
    scrollToAnchor = function (anchorId, adjustment, callback) {
      const anchor = $('#' + anchorId);
      $('html, body').animate({ scrollTop: anchor.offset().top + (adjustment || 0) }, callback);
    },
    disableControl = function (control, opacity) {
      control.prop('disabled', true);
      unsetClick(control);
      control.css('opacity', opacity || '0.3');
    },
    disableControls = function (controls, opacity) {
      controls.forEach(function (control) {
        disableControl(control, opacity);
      });
    },
    enableControl = function (control, clickCallback, opacity) {
      control.prop('disabled', false);
      setClick(control, clickCallback);
      control.css('opacity', opacity || '1.0');
    },
    enableOrDisableControl = function (predicate, control, clickCallback, opacity) {
      if (predicate) {
        enableControl(control, clickCallback, opacity);
        return;
      }
      disableControl(control, opacity);
    },
    showToaster = function (parent, toaster, text, callback) {
      var left, top, width;
      top = parent.offset().top;
      left = parent.offset().left;
      width = parent.width();
      toaster.addClass('toaster');
      toaster.css('left', left);
      toaster.css('top', top);
      toaster.css('width', width);
      toaster.text(text);
      toaster.show();
      toaster.delay(1000).hide('slow');
      if (callback) {
        callback();
      }
    },
    trapEnterKeyOnControl = function (selector) {
      selector.off('keydown');
      selector.on('keydown', function (evt) {
        var charCode = (evt.which) || evt.keyCode;
        if (charCode === 13) {
          evt.preventDefault();
        }
      });
    },
    trapEnterKey = function (enterKeyFunction) {
      $(document).off('keypress');
      $(document).keypress(function (e) {
        if (e.which === 13) {
          enterKeyFunction();
        }
      });
    },
    showWaitingCursor = function () {
      $('body').css('cursor', 'wait');
    },
    hideWaitingCursor = function () {
      $('body').css('cursor', 'default');
    },
    isNumericKey = function (e) {
      var charCode = (e.which) || e.charCode || e.keyCode;
      return (charCode >= 48 && charCode <= 57) || charCode === 45 || charCode === 46;
    },
    setErrorCondition = function (inputControl, errorControl, message) {
      errorControl.hide();
      inputControl.removeClass('invalidField');
      if (message) {
        errorControl.text(message);
        errorControl.show();
        inputControl.addClass('invalidField');
      }
    },
    getDeviceType = function () {
      return $('#navMissionMenu').is(':visible') ? 'mobile' : 'desktop';
    };
  return {
    createImageLink: createImageLink,
    createLink: createLink,
    createMailToImageLink: createMailToImageLink,
    getOptionValueFromText: getOptionValueFromText,
    getSelectedOptionText: getSelectedOptionText,
    createSelect: createSelect,
    fillSelectFromList: fillSelectFromList,
    fillSelectFromKeyValuePairs: fillSelectFromKeyValuePairs,
    display: display,
    createFileInput: createFileInput,
    createCheckboxInput: createCheckboxInput,
    createNumericInput: createNumericInput,
    createFixedColumnsTable: createFixedColumnsTable,
    createSpan: createSpan,
    createContainer: createContainer,
    createTextArea: createTextArea,
    createTable: createTable,
    createImage: createImage,
    createRow: createRow,
    createCell: createCell,
    createTextInput: createTextInput,
    initializeInput: initializeInput,
    initializeCheckboxInput: initializeCheckboxInput,
    initializeSelect: initializeSelect,
    createOption: createOption,
    createOptionBase: createOptionBase,
    appendCell: appendCell,
    exportTableToCSV: exportTableToCSV,
    copyToClipboard: copyToClipboard,
    scrollToAnchor: scrollToAnchor,
    disableControls: disableControls,
    disableControl: disableControl,
    enableControl: enableControl,
    enableOrDisableControl: enableOrDisableControl,
    showToaster: showToaster,
    trapEnterKeyOnControl: trapEnterKeyOnControl,
    trapEnterKey: trapEnterKey,
    isNumericKey: isNumericKey,
    setErrorCondition: setErrorCondition,
    setClick: setClick,
    unsetClick: unsetClick,
    showWaitingCursor: showWaitingCursor,
    hideWaitingCursor: hideWaitingCursor,
    getDeviceType
  };
};