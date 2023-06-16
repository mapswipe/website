import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props<NAME, OPTION, VALUE> extends Omit<React.HTMLProps<HTMLSelectElement>, 'ref' | 'onChange' | 'value' | 'name' | 'label'> {
    className?: string;
    name: NAME;
    value: VALUE | null | undefined;
    onChange: (
        value: VALUE | undefined,
        name: NAME,
        e?: React.FormEvent<HTMLSelectElement> | undefined,
    ) => void;
    options: OPTION[];
    keySelector: (option: OPTION) => VALUE;
    labelSelector: (option: OPTION) => string;
    elementRef?: React.Ref<HTMLSelectElement>;
}

function SelectInput<
    const NAME,
    OPTION,
    VALUE extends string,
>(props: Props<NAME, OPTION, VALUE>) {
    const {
        className,
        onChange,
        elementRef,
        value,
        name,
        options,
        keySelector,
        labelSelector,
        placeholder,
        ...otherProps
    } = props;

    const handleChange = React.useCallback((e: React.FormEvent<HTMLSelectElement>) => {
        const v = e.currentTarget.value as VALUE;

        if (onChange) {
            onChange(
                v === '' ? undefined : v,
                name,
                e,
            );
        }
    }, [name, onChange]);

    return (
        <select
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef}
            className={_cs(
                styles.selectInput,
                className,
            )}
            name={isDefined(name) ? String(name) : undefined}
            onChange={handleChange}
            value={value ?? undefined}
        >
            <option
                value=""
            >
                {placeholder}
            </option>
            {options.map((option) => (
                <option
                    value={keySelector(option)}
                    key={keySelector(option)}
                >
                    {labelSelector(option)}
                </option>
            ))}
        </select>
    );
}

export default SelectInput;
