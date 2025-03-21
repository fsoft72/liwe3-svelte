import type { IconSource } from 'svelte-hero-icons';

export type Tree = {
	children: TreeItem[];
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TreeItem = {
	id: string;

	name: string;
	isOpen?: boolean;
	children?: TreeItem[];

	icon?: IconSource;

	info?: any; // additional node info

	// internal use only
	id_parent?: string;
	pos?: number;
	level: number;
};

// recursively set the tree meta info (pos and level)
const _tree_items_set_meta = ( items: TreeItem[], id_parent: string, level: number ) => {

	for ( let i = 0; i < items.length; i++ ) {
		const item = items[ i ];
		item.id_parent = id_parent;
		item.pos = i;
		item.level = level;
		if ( item.children ) {
			_tree_items_set_meta( item.children, item.id, level + 1 );
		}
	}

	return items;
};

export const tree_set_meta = ( tree: Tree ) => {
	return _tree_items_set_meta( tree.children, '', 0 );
};

// recursively find an item in the tree structure by ID
const _tree_find_item = ( items: TreeItem[], id: string ): TreeItem | undefined => {
	for ( let i = 0; i < items.length; i++ ) {
		const item = items[ i ];

		if ( item.id === id ) return item;

		if ( item.children ) {
			const found = _tree_find_item( item.children, id );
			if ( found ) return found;
		}
	}
	return undefined;
};

export const tree_find_item = ( tree: Tree, id: string ): TreeItem | undefined => {
	return _tree_find_item( tree.children, id );
};

const _tree_del_item = ( items: TreeItem[], id: string ): TreeItem[] => {
	const item = _tree_find_item( items, id );

	if ( !item ) return items;

	const parentItem = _tree_find_item( items, item.id_parent ?? '' );

	if ( parentItem ) parentItem.children = parentItem.children?.filter( ( item ) => item.id !== id );
	else items = items.filter( ( item ) => item.id !== id );

	return items;
};

export const tree_del_item = ( tree: Tree, id: string ): TreeItem[] => {
	tree.children = _tree_del_item( tree.children, id );

	tree_set_meta( tree );

	return tree.children;
};

const _tree_add_item = ( items: TreeItem[], item: TreeItem, id_parent: string ) => {
	let parentItem: TreeItem | undefined;

	if ( id_parent ) {
		parentItem = _tree_find_item( items, id_parent );
		if ( !parentItem ) {
			console.error( `Parent item with ID ${ id_parent } not found` );
			return items;
		}
		parentItem.isOpen = true;
		if ( !parentItem.children ) parentItem.children = [];
	}

	if ( !item.id ) item.id = new Date().getTime().toString();
	if ( !item.children ) item.children = [];

	item.id_parent = id_parent;

	if ( parentItem ) {
		parentItem.children?.push( item );
	} else {
		items.push( item );
	}

	return items;
};

export const tree_add_item = ( tree: Tree, item: TreeItem, id_parent: string ): TreeItem[] => {
	const res = _tree_add_item( tree.children, item, id_parent );

	tree_set_meta( tree );

	return res;
};


/**
 * Updates an item in the tree structure, by replacing the item with the same ID.
 *
 * @param items - The list of items to update.
 * @param item - The item to update.
 *
 * @returns The updated list of items.
 */
export const tree_update_item = ( items: TreeItem[], item: TreeItem ) => {
	const found = _tree_find_item( items, item.id );

	if ( !found ) return items;

	Object.assign( found, item );

	return items;
};

const _tree_convert_list = ( items: any[], id = 'id', title = 'title', id_parent = 'id_parent' ) => {
	const res: TreeItem[] = [];

	items.forEach( ( item ) => {
		const newItem: TreeItem = {
			id: item[ id ],
			name: item[ title ],
			id_parent: item[ id_parent ],
			children: [],
			level: 0
		};

		if ( !newItem.id_parent ) {
			res.push( newItem );
		} else {
			const parent = _tree_find_item( res, newItem.id_parent );
			if ( parent ) parent.children?.push( newItem );
		}
	} );

	_tree_items_set_meta( res, '', 0 );

	return res;
};

/**
 * Converts a flat list of items into a tree structure.
 *
 * @param items - The list of items to convert.
 * @param id - The name of the property that contains the item ID [default: 'id'].
 * @param title - The name of the property that contains the item title [default: 'title'].
 * @param id_parent - The name of the property that contains the ID of the item's parent [default: 'id_parent'].
 *
 * @returns The resulting tree structure.
 */
export const tree_convert_list = ( items: any[], id = 'id', title = 'title', id_parent = 'id_parent' ): Tree => {
	const children = _tree_convert_list( items, id, title, id_parent );

	return {
		children,
	};
};
