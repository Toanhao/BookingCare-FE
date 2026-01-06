import React, { useRef, useEffect, memo } from 'react';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';

import { KeyCodeUtils } from '../../utils';
import './DatePicker.scss';

const SEPERATOR = '/';
const DATE_FORMAT_AUTO_FILL = 'd/m/Y';
const DISPLAY_FORMAT = 'd/m/Y';

const checkDateValue = (str, max) => {
  if (str.charAt(0) !== '0' || str === '00') {
    var num = parseInt(str);
    if (isNaN(num) || num <= 0 || num > max) num = 1;
    str =
      num > parseInt(max.toString().charAt(0)) && num.toString().length === 1
        ? '0' + num
        : num.toString();
  }
  return str;
};

const autoFormatOnChange = (value, seperator) => {
  var input = value;
  let regexForDeleting = new RegExp(`\\D\\${seperator}$`);

  if (regexForDeleting.test(input)) input = input.substr(0, input.length - 3);

  var values = input.split(seperator).map(function (v) {
    return v.replace(/\\D/g, '');
  });

  if (values[0]) values[0] = checkDateValue(values[0], 31);
  if (values[1]) values[1] = checkDateValue(values[1], 12);
  var output = values.map(function (v, i) {
    return v.length === 2 && i < 2 ? v + ' ' + seperator + ' ' : v;
  });
  return output.join('').substr(0, 14);
};

const DatePicker = ({ value, onChange, minDate, onClose, disabled, ...otherProps }) => {
  const flatpickrRef = useRef(null);
  const flatpickrNodeRef = useRef(null);

  // Validate and normalize value
  const normalizedValue = React.useMemo(() => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (typeof value === 'string') {
      const parsed = moment(value);
      return parsed.isValid() ? parsed.toDate() : null;
    }
    return null;
  }, [value]);

  const handleBlur = (event) => {
    const val = event.target.value;
    event.preventDefault();
    const valueMoment = moment(val, 'DD/MM/YYYY');
    onChange([valueMoment.toDate(), valueMoment.toDate()]);
  };

  const handlerKeyDown = (event) => {
    const keyCode = event.which || event.keyCode;
    if (keyCode === KeyCodeUtils.ENTER) {
      event.preventDefault();
      const val = event.target.value;
      const valueMoment = moment(val, 'DD/MM/YYYY');
      onChange([valueMoment.toDate(), valueMoment.toDate()]);
    }
  };

  const onOpen = () => {
    if (flatpickrNodeRef.current) {
      flatpickrNodeRef.current.blur();
    }
  };

  const nodeRef = (element) => {
    if (element) {
      flatpickrRef.current = element.flatpickr;
      flatpickrNodeRef.current = element.node;
    }
  };

  useEffect(() => {
    const node = flatpickrNodeRef.current;
    if (node) {
      node.addEventListener('blur', handleBlur);
      node.addEventListener('keydown', handlerKeyDown);
    }
    return () => {
      if (node) {
        node.removeEventListener('blur', handleBlur);
        node.removeEventListener('keydown', handlerKeyDown);
      }
    };
  }, [onChange]);

  const onInputChange = (e) => {
    if (DISPLAY_FORMAT === DATE_FORMAT_AUTO_FILL) {
      let converted = autoFormatOnChange(e.target.value, SEPERATOR);
      e.target.value = converted;
    }
  };

  const options = {
    dateFormat: DISPLAY_FORMAT,
    allowInput: true,
    disableMobile: true,
    onClose: onClose,
    onOpen: onOpen,
  };

  if (minDate) {
    options.minDate = minDate;
  }

  // If disabled, render a simple input to avoid Flatpickr initialization issues
  if (disabled) {
    const displayValue = normalizedValue
      ? moment(normalizedValue).format('DD/MM/YYYY')
      : '';
    return (
      <input
        type="text"
        value={displayValue}
        disabled={true}
        {...otherProps}
      />
    );
  }

  return (
    <Flatpickr
      ref={nodeRef}
      value={normalizedValue}
      onChange={onChange}
      options={options}
      {...otherProps}
    />
  );
};

export default memo(DatePicker);
