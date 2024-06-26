export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// export type Color = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'alternative';
export type Color = 'mode1' | 'mode2' | 'mode3' | 'mode4' | 'primary' | 'secondary' | 'success' | 'error' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'alternative' | 'background' | 'color' | 'link';
export type LayoutVars = 'font-size' | 'font-weight' | 'line-height' | 'border-radius' | 'border-width' | 'border-style' | 'button-padding-y' | 'button-padding-x' | 'input-padding-y' | 'input-padding-x';

export type Variant = 'solid' | 'outline' | 'link';
export type InputVariant = 'material' | 'boxed' | 'plain' | 'none';

export type SelectItem = {
	id: string;
	label: string;
	selectable?: boolean;
	indent?: number;
};