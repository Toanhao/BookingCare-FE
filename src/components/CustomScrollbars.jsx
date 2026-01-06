import React, { useRef, useCallback, useEffect, memo } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

import './CustomScrollbars.scss';

const CustomScrollbars = (props) => {
    const ref = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const scrollAbortRef = useRef(false);

    useEffect(() => {
        return () => {
            // Cleanup timeouts on unmount
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollAbortRef.current = true;
        };
    }, []);

    const getScrollLeft = useCallback(() => {
        const scrollbars = ref.current;
        return scrollbars ? scrollbars.getScrollLeft() : 0;
    }, []);

    const getScrollTop = useCallback(() => {
        const scrollbars = ref.current;
        return scrollbars ? scrollbars.getScrollTop() : 0;
    }, []);

    const scrollToBottom = useCallback(() => {
        if (!ref || !ref.current) {
            return;
        }
        const scrollbars = ref.current;
        const targetScrollTop = scrollbars.getScrollHeight();
        scrollTo(targetScrollTop);
    }, []);

    const scrollTo = (targetTop) => {
        const { quickScroll } = props;
        if (!ref || !ref.current) {
            return;
        }
        const scrollbars = ref.current;
        const originalTop = scrollbars.getScrollTop();
        let iteration = 0;
        scrollAbortRef.current = false;

        const scroll = () => {
            if (scrollAbortRef.current) return;
            iteration++;
            if (iteration > 30) {
                return;
            }
            scrollbars.scrollTop(originalTop + (targetTop - originalTop) / 30 * iteration);

            if (quickScroll && quickScroll === true) {
                scroll();
            } else {
                scrollTimeoutRef.current = setTimeout(() => {
                    scroll();
                }, 20);
            }
        };

        scroll();
    };

    const renderTrackHorizontal = (propsHorizontal) => (
        <div {...propsHorizontal} className="track-horizontal" />
    );

    const renderTrackVertical = (propsVertical) => (
        <div {...propsVertical} className="track-vertical" />
    );

    const renderThumbHorizontal = (propsHorizontal) => (
        <div {...propsHorizontal} className="thumb-horizontal" />
    );

    const renderThumbVertical = (propsVertical) => (
        <div {...propsVertical} className="thumb-vertical" />
    );

    const renderNone = () => <div />;

    const { className, disableVerticalScroll, disableHorizontalScroll, children, ...otherProps } = props;

    return (
        <Scrollbars
            ref={ref}
            autoHide={true}
            autoHideTimeout={200}
            hideTracksWhenNotNeeded={true}
            className={className ? className + ' custom-scrollbar' : 'custom-scrollbar'}
            {...otherProps}
            renderTrackHorizontal={disableHorizontalScroll ? renderNone : renderTrackHorizontal}
            renderTrackVertical={disableVerticalScroll ? renderNone : renderTrackVertical}
            renderThumbHorizontal={disableHorizontalScroll ? renderNone : renderThumbHorizontal}
            renderThumbVertical={disableVerticalScroll ? renderNone : renderThumbVertical}
        >
            {children}
        </Scrollbars>
    );
};

export default memo(CustomScrollbars);