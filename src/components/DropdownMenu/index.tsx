import {
    useState,
    useCallback,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoChevronDown,
    IoChevronUp,
} from 'react-icons/io5';

import Popup from 'components/Popup';
import Button, { Props as ButtonProps } from 'components/Button';
import useBlurEffect from 'hooks/useBlurEffect';

export interface Props {
    className?: string;
    dropdownContainerClassName?: string;
    children?: React.ReactNode;
    label?: React.ReactNode;
    activeClassName?: string;
    hideDropdownIcon?: boolean;
}

function DropdownMenu(props: Props) {
    const {
        className,
        dropdownContainerClassName,
        children,
        label,
        activeClassName,
        hideDropdownIcon,
    } = props;

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleMenuClick: NonNullable<ButtonProps['onClick']> = useCallback(
        (e) => {
            e.stopPropagation();
            setShowDropdown((prevValue) => !prevValue);
        },
        [setShowDropdown],
    );

    const handleBlurCallback = useCallback(
        (_: boolean, clickedInParent: boolean) => {
            const isClickedWithin = clickedInParent;
            if (isClickedWithin) {
                return;
            }
            setShowDropdown(false);
        },
        [setShowDropdown],
    );

    useBlurEffect(
        showDropdown,
        handleBlurCallback,
        dropdownRef,
        buttonRef,
    );

    return (
        <>
            <Button
                name={undefined}
                className={_cs(className, showDropdown && activeClassName)}
                elementRef={buttonRef}
                variant="border"
                onClick={handleMenuClick}
            >
                {label}
                {!hideDropdownIcon && (showDropdown
                    ? <IoChevronUp />
                    : <IoChevronDown />
                )}
            </Button>
            {showDropdown && (
                <Popup
                    elementRef={dropdownRef}
                    className={dropdownContainerClassName}
                    parentRef={buttonRef}
                >
                    {children}
                </Popup>
            )}
        </>
    );
}

export default DropdownMenu;
