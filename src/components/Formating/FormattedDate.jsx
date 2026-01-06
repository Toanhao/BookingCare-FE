import React, { memo } from 'react';
import moment from 'moment';

const dateFormat = 'DD/MM/YYYY';

const FormattedDate = memo(({ format, value, ...otherProps }) => {
    const dFormat = format ? format : dateFormat;
    const formattedValue = value ? moment.utc(value).format(dFormat) : null;
    return (
        <span {...otherProps}>{formattedValue}</span>
    );
});

export default FormattedDate;