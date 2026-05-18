# Welcome to Markdown Viewer

This is an example markdown file to demonstrate the viewer's capabilities.

## Features

- **File tree navigation** with folder support
- **GitHub-flavored Markdown** rendering
- **Syntax highlighting** for code blocks
- **Responsive design** for mobile devices

## Code Example

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

## Table Example

| Name | Type | Description |
|------|------|-------------|
| Express | Backend | Web framework for Node.js |
| marked | Frontend | Markdown parser |
| highlight.js | Frontend | Syntax highlighter |

## Blockquote

> The best way to predict the future is to invent it.
> — Alan Kay

## Task List

- [x] Set up project structure
- [x] Implement backend API
- [x] Build frontend UI
- [ ] Add dark mode support
