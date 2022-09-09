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

export function setField(fieldName: string, value: string) {
  const fld = 
    document.querySelector(`input[name=${fieldName}]`) as HTMLInputElement
    || document.querySelector(`textarea[name=${fieldName}]`) as HTMLTextAreaElement;
  if (fld) {
    fld.value = value;
  }
}

export function setCheckbox(fieldName: string, value: boolean) {
  const fld = 
    document.querySelector(`input[name=${fieldName}]`) as HTMLInputElement
  if (fld) {
    fld.checked = value;
  }
}

export function getFieldValue(fieldName: string): string | null {
  const fld = 
    document.querySelector(`input[name=${fieldName}]`) as HTMLInputElement
    || document.querySelector(`textarea[name=${fieldName}]`) as HTMLTextAreaElement;
  return fld?.value;
}

export function isCheckboxChecked(fieldName: string) {
  const fld = 
    document.querySelector(`input[name=${fieldName}]`) as HTMLInputElement
  return fld?.checked
}

export function removePrecedingWhitespace(node: Node) {
  let prev: Node | null;
  while (prev = node.previousSibling) {
    if (prev.nodeType === Node.TEXT_NODE && /^\s*$/.test(prev.nodeValue as string)) {
      prev.parentNode?.removeChild(prev);
    } else {
      return;
    }
  }
}
