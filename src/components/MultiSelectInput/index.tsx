import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from 'components/Button';

import styles from './styles.module.css';

interface OptionProps<OPTION, VALUE> {
    onChange: (newVal: VALUE[] | undefined) => void;
    value: VALUE[] | null | undefined;
    option: OPTION;
    keySelector: (option: OPTION) => VALUE;
    labelSelector: (option: OPTION) => string | React.ReactNode;
    iconSelector?: (option: OPTION) => React.ReactNode;
}

function OptionRenderer<OPTION, VALUE>(props: OptionProps<OPTION, VALUE>) {
    const {
        onChange,
        value,
        option,
        keySelector,
        iconSelector,
        labelSelector,
    } = props;

    const key = keySelector(option);

    const isSelected = (value?.indexOf(key) ?? -1) !== -1;

    const handleClick = useCallback(() => {
        const index = value?.indexOf(keySelector(option)) ?? -1;
        if (index >= 0) {
            const newVal = [...(value ?? [])];
            newVal.splice(index, 1);
            onChange(newVal.length > 0 ? newVal : undefined);
        } else if (index) {
            onChange([...(value ?? []), key]);
        }
    }, [
        key,
        onChange,
        value,
        keySelector,
        option,
    ]);

    return (
        <Button
            className={_cs(
                styles.option,
                isSelected && styles.selected,
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
    value: VALUE[] | null | undefined;
    onChange: (value: VALUE[] | undefined) => void;
    options: OPTION[];
    label?: string;
    keySelector: (option: OPTION) => VALUE;
    labelSelector: (option: OPTION) => string | React.ReactNode;
    iconSelector?: (option: OPTION) => React.ReactNode;
}

function MultiSelectInput<
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
                        value={value}
                        onChange={onChange}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        iconSelector={iconSelector}
                    />
                ))}
            </div>
        </div>
    );
}

export default MultiSelectInput;
