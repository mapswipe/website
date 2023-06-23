import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from 'components/Button';

import styles from './styles.module.css';

interface OptionProps<OPTION, VALUE> {
    onChange: (newVal: VALUE | undefined) => void;
    value: VALUE | null | undefined;
    option: OPTION;
    keySelector: (option: OPTION) => VALUE;
    labelSelector: (option: OPTION) => string | React.ReactNode;
    iconSelector?: (option: OPTION) => React.ReactNode;
    optionSize?: 'small' | 'medium' | 'large';
}

function OptionRenderer<OPTION, VALUE>(props: OptionProps<OPTION, VALUE>) {
    const {
        onChange,
        value,
        option,
        keySelector,
        iconSelector,
        labelSelector,
        optionSize,
    } = props;

    const key = keySelector(option);

    const isSelected = value === key;

    const handleClick = useCallback(() => {
        if (value === key) {
            onChange(undefined);
        } else {
            onChange(key);
        }
    }, [
        key,
        onChange,
        value,
    ]);

    return (
        <Button
            className={_cs(
                styles.option,
                isSelected && styles.selected,
                optionSize === 'small' && styles.small,
            )}
            onClick={handleClick}
            variant="transparent"
        >
            {iconSelector ? iconSelector(option) : undefined}
            {labelSelector(option)}
        </Button>
    );
}

export interface Props<OPTION, VALUE> {
    className?: string;
    value: VALUE | null | undefined;
    onChange: (value: VALUE | undefined) => void;
    options: OPTION[];
    label?: string;
    keySelector: (option: OPTION) => VALUE;
    labelSelector: (option: OPTION) => string | React.ReactNode;
    iconSelector?: (option: OPTION) => React.ReactNode;
    optionSize?: 'small' | 'medium' | 'large';
}

function RadioInput<
    OPTION,
    VALUE extends string,
>(props: Props<OPTION, VALUE>) {
    const {
        className,
        onChange,
        value,
        options,
        keySelector,
        labelSelector,
        iconSelector,
        label,
        optionSize,
    } = props;

    return (
        <div className={_cs(className, styles.input)}>
            <div>
                {label}
            </div>
            <div className={styles.optionsContainer}>
                {options.map((option) => (
                    <OptionRenderer
                        option={option}
                        key={keySelector(option)}
                        value={value}
                        onChange={onChange}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        optionSize={optionSize}
                        iconSelector={iconSelector}
                    />
                ))}
            </div>
        </div>
    );
}

export default RadioInput;
