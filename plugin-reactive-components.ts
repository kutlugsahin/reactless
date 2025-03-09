import { Plugin } from 'vite'
import * as babel from '@babel/core'
import jsx from '@babel/plugin-syntax-jsx'
import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export type Options = {
	libraryName?: string;
	supportedExtensions?: string[];
};
export default function wrapReactComponents({
  libraryName = '@impair',
  supportedExtensions = ['.tsx'],
}: Options = {}): Plugin {
  return {
    name: 'vite-plugin-reactive-components',
    enforce: 'post', // Ensure transformations like JSX are done first
    transform(code: string, id: string) {
      if (!supportedExtensions.some((ext) => id.endsWith(ext))) return

      const result = babel.transformSync(code, {
        plugins: [
          jsx,
          function plugin() {
            return {
              visitor: {
                Program(path: NodePath<t.Program>) {
                  let hasComponent = false
                  let importAdded = false

                  // Check for any components in the file
                  path.traverse({
                    ImportDeclaration(innerPath) {
                      const source = innerPath.node.source.value
                      innerPath.node.specifiers.forEach((specifier) => {
                        if (t.isImportSpecifier(specifier)) {
                          // Check for named import `component`
                          if (
                            specifier.imported &&
														(specifier.imported as t.Identifier).name === 'component' &&
														source === libraryName
                          ) {
                            importAdded = true
                          }
                        }
                      })
                    },
                    FunctionDeclaration(innerPath) {
                      if (isReactComponent(innerPath.node, innerPath)) {
                        hasComponent = true
                      }
                    },
                    VariableDeclaration(innerPath) {
                      innerPath.node.declarations.forEach((declaration) => {
                        if (
                          declaration.init &&
													(t.isArrowFunctionExpression(declaration.init) || t.isFunctionExpression(declaration.init)) &&
													isReactComponent(declaration.init, innerPath)
                        ) {
                          hasComponent = true
                        }
                      })
                    },
                  })

                  // Add the import statement if a component is found
                  if (hasComponent && !importAdded) {
                    path.unshiftContainer(
                      'body',
                      t.importDeclaration(
                        [t.importSpecifier(t.identifier('component'), t.identifier('component'))],
                        t.stringLiteral(libraryName),
                      ),
                    )
                    importAdded = true
                  }
                },

                // Process Function Declarations
                FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
                  console.log('FunctionDeclaration', path.node.id?.name)

                  if (isReactComponent(path.node, path)) {
                    wrapFunctionDeclaration(path)
                  }
                },

                // Export Named Declarations (for named function exports like `export function MyComp() {}`)
                ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
                  const declaration = path.node.declaration

                  // Handle function declarations inside the named export
                  if (t.isFunctionDeclaration(declaration)) {
                    const functionPath = path.get('declaration') as NodePath<t.FunctionDeclaration>

                    if (isReactComponent(declaration, functionPath)) {
                      // Pass functionPath instead of path
                      console.log('ExportNamedDeclarationFunction', declaration)
                      wrapExportedFunctionDeclaration(path, functionPath)
                    }
                  }
                },
              },
            }
          },
        ],
        filename: id,
      })

      return result?.code ?? code
    },
  }
}

/**
 * Determines if a function looks like a React component (by convention).
 */
function isReactComponent(node: t.Node, path: NodePath<any>): boolean {
  if (t.isFunctionDeclaration(node)) {
    // For function declarations, we check if it's a React component
    return !!node.id && /^[A-Z]/.test(node.id.name) && containsImpairHooks(path.get('body') as any)
  }

  return false
}

function containsImpairHooks(path: NodePath<t.Node> | undefined): boolean {
  if (!path) return false

  let usesHook = false

  path.traverse({
    CallExpression(innerPath) {
      if (
        t.isIdentifier(innerPath.node.callee) &&
				(innerPath.node.callee.name === 'useService' || innerPath.node.callee.name === 'useViewModel')
      ) {
        usesHook = true
        innerPath.stop() // Stop early once a match is found
      }
    },
  })

  return usesHook
}

/**
 * Wraps a function declaration component with the HOC `component()`.
 */
function wrapFunctionDeclaration(path: NodePath<t.FunctionDeclaration>): void {
  const funcName = path.node.id?.name
  if (!funcName || !path.node.id) return

  const newFuncName = `_${funcName}`
  path.node.id.name = newFuncName

  const wrapped = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(funcName),
      t.callExpression(t.identifier('component'), [t.identifier(newFuncName)]),
    ),
  ])

  path.insertAfter(wrapped)
}

/**
 * Wraps an **exported** function declaration with the HOC `component()`.
 */
function wrapExportedFunctionDeclaration(
  exportPath: NodePath<t.ExportNamedDeclaration>,
  funcPath: NodePath<t.FunctionDeclaration>,
): void {
  const funcName = funcPath.node.id?.name
  if (!funcName || !funcPath.node.id) return

  const newFuncName = `_${funcName}`
  funcPath.node.id.name = newFuncName

  // Replace the exported function declaration with a const declaration that wraps it
  exportPath.replaceWith(
    t.exportNamedDeclaration(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier(funcName),
          t.callExpression(t.identifier('component'), [t.identifier(newFuncName)]),
        ),
      ]),
      [],
    ),
  )

  // Insert the function declaration before the export
  exportPath.insertBefore(funcPath.node)
}
