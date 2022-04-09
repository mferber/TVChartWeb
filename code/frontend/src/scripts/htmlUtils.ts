export function createElement(tagName: string, className: string | null, children: Node[]): HTMLElement {
  const elt = document.createElement(tagName);
  populateElement(elt, className, children);
  return elt;
}

export function createElementNS(tagName: string, namespaceURI: string, className: string | null, children: Node[]): Element {
  const elt = document.createElementNS(namespaceURI, tagName);
  populateElement(elt, className, children);
  return elt;
}

function populateElement(elt: Element, className: string | null, children: Node[]) {
  if (className) {
    elt.className = className;
  }
  children.forEach(c => elt.appendChild(c));
}