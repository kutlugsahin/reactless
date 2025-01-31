import { Plugin } from 'vite';
import * as babel from '@babel/core';
import jsx from '@babel/plugin-syntax-jsx';
import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';

export type Options = {
	libraryName?: string;
};

export default function wrapReactComponents({ libraryName = '@impair' }: Options = {}): Plugin {
	return {
		name: 'vite-plugin-reactive-components',
		enforce: 'post', // Ensure transformations like JSX are done first
		transform(code: string, id: string) {
			if (!id.endsWith('.tsx')) return; // Only process .tsx files

			let importAdded = false;
			const result = babel.transformSync(code, {
				plugins: [
					jsx,
					function myPlugin() {
						return {
							visitor: {
								Program(path: NodePath<t.Program>) {
									let hasComponent = false;

									// Check for any components in the file
									path.traverse({
										FunctionDeclaration(innerPath) {
											if (isReactComponent(innerPath.node, innerPath)) {
												hasComponent = true;
											}
										},
										VariableDeclaration(innerPath) {
											innerPath.node.declarations.forEach((declaration) => {
												if (
													declaration.init &&
													(t.isArrowFunctionExpression(declaration.init) || t.isFunctionExpression(declaration.init)) &&
													isReactComponent(declaration.init, innerPath)
												) {
													hasComponent = true;
												}
											});
										},
									});

									// Add the import statement if a component is found
									if (hasComponent && !importAdded) {
										path.unshiftContainer(
											'body',
											t.importDeclaration(
												[t.importSpecifier(t.identifier('component'), t.identifier('component'))],
												t.stringLiteral(libraryName)
											)
										);
										importAdded = true;
									}
								},

								// Process Function Declarations
								FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
									if (isReactComponent(path.node, path)) {
										wrapFunctionDeclaration(path);
									}
								},

								// Process Variable Declarations (for arrow functions or function expressions)
								VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
									path.node.declarations.forEach((declaration) => {
										if (
											declaration.init &&
											(t.isArrowFunctionExpression(declaration.init) || t.isFunctionExpression(declaration.init)) &&
											isReactComponent(declaration.init, path)
										) {
											wrapVariableDeclaration(path, declaration);
										}
									});
								},

								// Export Named Declarations
								ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
									const declaration = path.node.declaration;

									if (t.isFunctionDeclaration(declaration)) {
										if (isReactComponent(declaration, path)) {
											wrapExportedFunctionDeclaration(path, path.get('declaration') as NodePath<t.FunctionDeclaration>);
										}
									} else if (t.isVariableDeclaration(declaration)) {
										declaration.declarations.forEach((declarator) => {
											if (
												declarator.init &&
												(t.isArrowFunctionExpression(declarator.init) || t.isFunctionExpression(declarator.init)) &&
												isReactComponent(declarator.init, path)
											) {
												wrapExportedVariableDeclaration(path, declarator);
											}
										});
									}
								},

								// Export Default Declarations
								ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
									if (t.isFunctionDeclaration(path.node.declaration)) {
										wrapExportedDefaultFunctionDeclaration(path);
									}
								},
							},
						};
					},
				],
				filename: id,
			});

			return result?.code ?? code;
		},
	};
}

/**
 * Determines if a function looks like a React component (by convention).
 */
function isReactComponent(node: t.Node, path: NodePath<any>): boolean {
	if (t.isFunctionDeclaration(node)) {
		return !!node.id && /^[A-Z]/.test(node.id.name); // Ensure name starts with uppercase
	}

	if (path.isVariableDeclaration()) {
		// A variable declaration can contain multiple declarators (const A = ... , B = ...;)
		for (const declarator of path.node.declarations) {
			if (
				t.isIdentifier(declarator.id) &&
				/^[A-Z]/.test(declarator.id.name) &&
				(t.isArrowFunctionExpression(declarator.init) || t.isFunctionExpression(declarator.init))
			) {
				return true;
			}
		}
	}

	if (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
		// For arrow functions, check the variable name it is assigned to
		const binding = path.findParent((p) => t.isVariableDeclaration(p.node));

		if (binding && t.isVariableDeclarator(binding.node) && t.isIdentifier(binding.node.id)) {
			return /^[A-Z]/.test(binding.node.id.name); // Check if variable starts with uppercase
		}
	}

	return false;
}

/**
 * Wraps a function declaration component with the HOC `component()`.
 */
function wrapFunctionDeclaration(path: NodePath<t.FunctionDeclaration>): void {
	const funcName = path.node.id?.name;
	if (!funcName || !path.node.id) return;

	const newFuncName = `_${funcName}`;
	path.node.id.name = newFuncName;

	const wrapped = t.variableDeclaration('const', [
		t.variableDeclarator(
			t.identifier(funcName),
			t.callExpression(t.identifier('component'), [t.identifier(newFuncName)])
		),
	]);

	path.insertAfter(wrapped);
}

/**
 * Wraps a variable declaration component with the HOC `component()`.
 */
function wrapVariableDeclaration(path: NodePath<t.VariableDeclaration>, declaration: t.VariableDeclarator): void {
	if (!t.isIdentifier(declaration.id)) return;

	const originalName = declaration.id.name;
	const newFuncName = `_${originalName}`;

	declaration.id.name = newFuncName;

	const wrapped = t.variableDeclaration('const', [
		t.variableDeclarator(
			t.identifier(originalName),
			t.callExpression(t.identifier('component'), [t.identifier(newFuncName)])
		),
	]);

	path.insertAfter(wrapped);
}

/**
 * Wraps an **exported** function declaration with the HOC `component()`.
 */
function wrapExportedFunctionDeclaration(
	exportPath: NodePath<t.ExportNamedDeclaration>,
	funcPath: NodePath<t.FunctionDeclaration>
): void {
	const funcName = funcPath.node.id?.name;
	if (!funcName || !funcPath.node.id) return;

	const newFuncName = `_${funcName}`;
	funcPath.node.id.name = newFuncName;

	exportPath.replaceWith(
		t.exportNamedDeclaration(
			t.variableDeclaration('const', [
				t.variableDeclarator(
					t.identifier(funcName),
					t.callExpression(t.identifier('component'), [t.identifier(newFuncName)])
				),
			]),
			[]
		)
	);

	exportPath.insertBefore(funcPath.node);
}

/**
 * Wraps an **exported variable declaration** (e.g., arrow function components).
 */
function wrapExportedVariableDeclaration(
	path: NodePath<t.ExportNamedDeclaration>,
	declarator: t.VariableDeclarator
): void {
	if (!t.isIdentifier(declarator.id)) return;

	const originalName = declarator.id.name;
	const newFuncName = `_${originalName}`;

	declarator.id.name = newFuncName;

	path.replaceWith(
		t.exportNamedDeclaration(
			t.variableDeclaration('const', [
				t.variableDeclarator(
					t.identifier(originalName),
					t.callExpression(t.identifier('component'), [t.identifier(newFuncName)])
				),
			]),
			[]
		)
	);

	path.insertBefore(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(newFuncName), declarator.init)]));
}

/**
 * Wraps an **export default function declaration**.
 */
function wrapExportedDefaultFunctionDeclaration(path: NodePath<t.ExportDefaultDeclaration>): void {
	const declaration = path.node.declaration;
	if (!t.isFunctionDeclaration(declaration) || !declaration.id) return;

	const funcName = declaration.id.name;
	const newFuncName = `_${funcName}`;
	declaration.id.name = newFuncName;

	path.replaceWith(
		t.exportDefaultDeclaration(t.callExpression(t.identifier('component'), [t.identifier(newFuncName)]))
	);

	path.insertBefore(declaration);
}
