'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _character = require('../models/character');

var _character2 = _interopRequireDefault(_character);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _placeholder = require('../components/placeholder');

var _placeholder2 = _interopRequireDefault(_placeholder);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _string = require('../utils/string');

var _string2 = _interopRequireDefault(_string);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:core');

/**
 * The default plugin.
 *
 * @param {Object} options
 *   @property {Element} placeholder
 *   @property {String} placeholderClassName
 *   @property {Object} placeholderStyle
 * @return {Object}
 */

function Plugin() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var placeholder = options.placeholder,
      placeholderClassName = options.placeholderClassName,
      placeholderStyle = options.placeholderStyle;

  /**
   * On before change, enforce the editor's schema.
   *
   * @param {State} state
   * @param {Editor} schema
   * @return {State}
   */

  function onBeforeChange(state, editor) {
    if (state.isNative) return state;
    var schema = editor.getSchema();
    return state.normalize(schema);
  }

  /**
   * On before input, see if we can let the browser continue with it's native
   * input behavior, to avoid a re-render for performance.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function onBeforeInput(e, data, state, editor) {
    var document = state.document,
        startKey = state.startKey,
        startOffset = state.startOffset,
        startInline = state.startInline,
        startText = state.startText;

    // Determine what the characters would be if natively inserted.

    var schema = editor.getSchema();
    var decorators = document.getDescendantDecorators(startKey, schema);
    var prevChars = startText.getDecorations(decorators);
    var prevChar = prevChars.get(startOffset - 1);
    var char = _character2.default.create({
      text: e.data,
      marks: prevChar && prevChar.marks
    });

    var chars = prevChars.slice(0, startOffset).push(char).concat(prevChars.slice(startOffset));

    // Determine what the characters should be, if not natively inserted.
    var next = state.transform().insertText(e.data).apply();

    var nextText = next.startText;
    var nextChars = nextText.getDecorations(decorators);

    // We do not have to re-render if the current selection is collapsed, the
    // current node is not empty, there are no marks on the cursor, the cursor
    // is not at the edge of an inline node, and the natively inserted
    // characters would be the same as the non-native.
    var isNative = state.isCollapsed && state.startText.text != '' && state.selection.marks == null && (!startInline || !state.selection.isAtStartOf(startInline)) && (!startInline || !state.selection.isAtEndOf(startInline)) && chars.equals(nextChars);

    // Add the `isNative` flag directly, so we don't have to re-transform.
    if (isNative) {
      next = next.merge({ isNative: isNative });
    }

    // If not native, prevent default so that the DOM remains untouched.
    if (!isNative) e.preventDefault();

    debug('onBeforeInput', { data: data, isNative: isNative });
    return next;
  }

  /**
   * On blur.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onBlur(e, data, state) {
    var isNative = true;

    debug('onBlur', { data: data, isNative: isNative });

    return state.transform().blur().apply({ isNative: isNative });
  }

  /**
   * On copy.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onCopy(e, data, state) {
    debug('onCopy', data);
    onCutOrCopy(e, data, state);
  }

  /**
   * On cut.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function onCut(e, data, state, editor) {
    debug('onCut', data);
    onCutOrCopy(e, data, state);
    var window = (0, _getWindow2.default)(e.target);

    // Once the fake cut content has successfully been added to the clipboard,
    // delete the content in the current selection.
    window.requestAnimationFrame(function () {
      var next = editor.getState().transform().delete().apply();

      editor.onChange(next);
    });
  }

  /**
   * On cut or copy, create a fake selection so that we can add a Base 64
   * encoded copy of the fragment to the HTML, to decode on future pastes.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onCutOrCopy(e, data, state) {
    var window = (0, _getWindow2.default)(e.target);
    var native = window.getSelection();
    if (!native.rangeCount) return;

    var fragment = data.fragment;

    var encoded = _base2.default.serializeNode(fragment);
    var range = native.getRangeAt(0);
    var contents = range.cloneContents();

    // Remove any zero-width space spans from the cloned DOM so that they don't
    // show up elsewhere when copied.
    var zws = [].slice.call(contents.querySelectorAll('.slate-zero-width-space'));
    zws.forEach(function (zw) {
      return zw.parentNode.removeChild(zw);
    });

    // Wrap the first character of the selection in a span that has the encoded
    // fragment attached as an attribute, so it will show up in the copied HTML.
    var wrapper = window.document.createElement('span');
    var text = contents.childNodes[0];
    var char = text.textContent.slice(0, 1);
    var first = window.document.createTextNode(char);
    var rest = text.textContent.slice(1);
    text.textContent = rest;
    wrapper.appendChild(first);
    wrapper.setAttribute('data-slate-fragment', encoded);
    contents.insertBefore(wrapper, text);

    // Add the phony content to the DOM, and select it, so it will be copied.
    var body = window.document.querySelector('body');
    var div = window.document.createElement('div');
    div.setAttribute('contenteditable', true);
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.appendChild(contents);
    body.appendChild(div);

    // COMPAT: In Firefox, trying to use the terser `native.selectAllChildren`
    // throws an error, so we use the older `range` equivalent. (2016/06/21)
    var r = window.document.createRange();
    r.selectNodeContents(div);
    native.removeAllRanges();
    native.addRange(r);

    // Revert to the previous selection right after copying.
    window.requestAnimationFrame(function () {
      body.removeChild(div);
      native.removeAllRanges();
      native.addRange(range);
    });
  }

  /**
   * On drop.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDrop(e, data, state) {
    debug('onDrop', { data: data });

    switch (data.type) {
      case 'text':
      case 'html':
        return onDropText(e, data, state);
      case 'fragment':
        return onDropFragment(e, data, state);
    }
  }

  /**
   * On drop fragment.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDropFragment(e, data, state) {
    debug('onDropFragment', { data: data });

    var selection = state.selection;
    var fragment = data.fragment,
        target = data.target,
        isInternal = data.isInternal;

    // If the drag is internal and the target is after the selection, it
    // needs to account for the selection's content being deleted.

    if (isInternal && selection.endKey == target.endKey && selection.endOffset < target.endOffset) {
      target = target.moveBackward(selection.startKey == selection.endKey ? selection.endOffset - selection.startOffset : selection.endOffset);
    }

    var transform = state.transform();

    if (isInternal) transform = transform.delete();

    return transform.moveTo(target).insertFragment(fragment).apply();
  }

  /**
   * On drop text, split the blocks at new lines.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDropText(e, data, state) {
    debug('onDropText', { data: data });

    var text = data.text,
        target = data.target;

    var transform = state.transform().moveTo(target);

    text.split('\n').forEach(function (line, i) {
      if (i > 0) transform = transform.splitBlock();
      transform = transform.insertText(line);
    });

    return transform.apply();
  }

  /**
   * On key down.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDown(e, data, state) {
    debug('onKeyDown', { data: data });

    switch (data.key) {
      case 'enter':
        return onKeyDownEnter(e, data, state);
      case 'backspace':
        return onKeyDownBackspace(e, data, state);
      case 'delete':
        return onKeyDownDelete(e, data, state);
      case 'left':
        return onKeyDownLeft(e, data, state);
      case 'right':
        return onKeyDownRight(e, data, state);
      case 'y':
        return onKeyDownY(e, data, state);
      case 'z':
        return onKeyDownZ(e, data, state);
      case 'k':
        return onKeyDownK(e, data, state);
    }
  }

  /**
   * On `enter` key down, split the current block in half.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownEnter(e, data, state) {
    debug('onKeyDownEnter', { data: data });

    var document = state.document,
        startKey = state.startKey,
        startBlock = state.startBlock;

    // For void blocks, we don't want to split. Instead we just move to the
    // start of the next text node if one exists.

    if (startBlock && startBlock.isVoid) {
      var text = document.getNextText(startKey);
      if (!text) return;
      return state.transform().collapseToStartOf(text).apply();
    }

    return state.transform().splitBlock().apply();
  }

  /**
   * On `backspace` key down, delete backwards.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownBackspace(e, data, state) {
    debug('onKeyDownBackspace', { data: data });

    // If expanded, delete regularly.
    if (state.isExpanded) {
      return state.transform().delete().apply();
    }

    var startOffset = state.startOffset,
        startBlock = state.startBlock;

    var text = startBlock.text;
    var n = void 0;

    // Determine how far backwards to delete.
    if (data.isWord) {
      n = _string2.default.getWordOffsetBackward(text, startOffset);
    } else if (data.isLine) {
      n = startOffset;
    } else {
      n = _string2.default.getCharOffsetBackward(text, startOffset);
    }

    return state.transform().deleteBackward(n).apply();
  }

  /**
   * On `delete` key down, delete forwards.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownDelete(e, data, state) {
    debug('onKeyDownDelete', { data: data });

    // If expanded, delete regularly.
    if (state.isExpanded) {
      return state.transform().delete().apply();
    }

    var startOffset = state.startOffset,
        startBlock = state.startBlock;

    var text = startBlock.text;
    var n = void 0;

    // Determine how far forwards to delete.
    if (data.isWord) {
      n = _string2.default.getWordOffsetForward(text, startOffset);
    } else if (data.isLine) {
      n = text.length - startOffset;
    } else {
      n = _string2.default.getCharOffsetForward(text, startOffset);
    }

    return state.transform().deleteForward(n).apply();
  }

  /**
   * On `left` key down, move backward.
   *
   * COMPAT: This is required to solve for the case where an inline void node is
   * surrounded by empty text nodes with zero-width spaces in them. Without this
   * the zero-width spaces will cause two arrow keys to jump to the next text.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownLeft(e, data, state) {
    if (data.isCtrl) return;
    if (data.isOpt) return;
    if (state.isExpanded) return;

    var document = state.document,
        startText = state.startText;

    var hasVoidParent = document.hasVoidParent(startText);

    if (startText.text == '' || hasVoidParent) {
      var previousText = document.getPreviousText(startText);
      if (!previousText) return;

      debug('onKeyDownLeft', { data: data });

      e.preventDefault();
      return state.transform().collapseToEndOf(previousText).apply();
    }
  }

  /**
   * On `right` key down, move forward.
   *
   * COMPAT: This is required to solve for the case where an inline void node is
   * surrounded by empty text nodes with zero-width spaces in them. Without this
   * the zero-width spaces will cause two arrow keys to jump to the next text.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownRight(e, data, state) {
    if (data.isCtrl) return;
    if (data.isOpt) return;
    if (state.isExpanded) return;

    var document = state.document,
        startText = state.startText;

    var hasVoidParent = document.hasVoidParent(startText);

    if (startText.text == '' || hasVoidParent) {
      var nextText = document.getNextText(startText);
      if (!nextText) return state;

      debug('onKeyDownRight', { data: data });

      e.preventDefault();
      return state.transform().collapseToStartOf(nextText).apply();
    }
  }

  /**
   * On `y` key down, redo.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownY(e, data, state) {
    if (!data.isMod) return;

    debug('onKeyDownY', { data: data });

    return state.transform().redo().apply({ save: false });
  }

  /**
   * On `z` key down, undo or redo.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownZ(e, data, state) {
    if (!data.isMod) return;

    debug('onKeyDownZ', { data: data });

    return state.transform()[data.isShift ? 'redo' : 'undo']().apply({ save: false });
  }

  /**
   * On `k` key down, delete untill the end of the line (mac only)
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownK(e, data, state) {
    if (!_environment.IS_MAC || !data.isCtrl) return;

    debug('onKeyDownK', { data: data });

    var startOffset = state.startOffset,
        startBlock = state.startBlock;


    return state.transform().deleteForward(startBlock.text.length - startOffset).apply();
  }

  /**
   * On paste.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPaste(e, data, state) {
    debug('onPaste', { data: data });

    switch (data.type) {
      case 'fragment':
        return onPasteFragment(e, data, state);
      case 'text':
      case 'html':
        return onPasteText(e, data, state);
    }
  }

  /**
   * On paste fragment.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPasteFragment(e, data, state) {
    debug('onPasteFragment', { data: data });

    return state.transform().insertFragment(data.fragment).apply();
  }

  /**
   * On paste text, split blocks at new lines.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPasteText(e, data, state) {
    debug('onPasteText', { data: data });

    var transform = state.transform();

    data.text.split('\n').forEach(function (line, i) {
      if (i > 0) transform = transform.splitBlock();
      transform = transform.insertText(line);
    });

    return transform.apply();
  }

  /**
   * On select.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onSelect(e, data, state) {
    var selection = data.selection;


    debug('onSelect', { data: data, selection: selection.toJS() });

    return state.transform().moveTo(selection).apply();
  }

  /**
   * A default schema rule to render block nodes.
   *
   * @type {Object}
   */

  var BLOCK_RENDER_RULE = {
    match: function match(node) {
      return node.kind == 'block';
    },
    render: function render(props) {
      return _react2.default.createElement(
        'div',
        _extends({}, props.attributes, { style: { position: 'relative' } }),
        props.children,
        placeholder ? _react2.default.createElement(
          _placeholder2.default,
          {
            className: placeholderClassName,
            node: props.node,
            parent: props.state.document,
            state: props.state,
            style: placeholderStyle
          },
          placeholder
        ) : null
      );
    }
  };

  /**
   * A default schema rule to render inline nodes.
   *
   * @type {Object}
   */

  var INLINE_RENDER_RULE = {
    match: function match(node) {
      return node.kind == 'inline';
    },
    render: function render(props) {
      return _react2.default.createElement(
        'span',
        _extends({}, props.attributes, { style: { position: 'relative' } }),
        props.children
      );
    }
  };

  /**
   * A default schema rule to only allow block nodes in documents.
   *
   * @type {Object}
   */

  var DOCUMENT_CHILDREN_RULE = {
    match: function match(node) {
      return node.kind == 'document';
    },
    validate: function validate(document) {
      var nodes = document.nodes;

      var invalids = nodes.filter(function (n) {
        return n.kind != 'block';
      });
      return invalids.size ? invalids : null;
    },
    normalize: function normalize(transform, document, invalids) {
      return invalids.reduce(function (t, n) {
        return t.removeNodeByKey(n.key);
      }, transform);
    }
  };

  /**
   * A default schema rule to only allow block, inline and text nodes in blocks.
   *
   * @type {Object}
   */

  var BLOCK_CHILDREN_RULE = {
    match: function match(node) {
      return node.kind == 'block';
    },
    validate: function validate(block) {
      var nodes = block.nodes;

      var invalids = nodes.filter(function (n) {
        return n.kind != 'block' && n.kind != 'inline' && n.kind != 'text';
      });
      return invalids.size ? invalids : null;
    },
    normalize: function normalize(transform, block, invalids) {
      return invalids.reduce(function (t, n) {
        return t.removeNodeByKey(n.key);
      }, transform);
    }
  };

  /**
   * A default schema rule to only allow inline and text nodes in inlines.
   *
   * @type {Object}
   */

  var INLINE_CHILDREN_RULE = {
    match: function match(object) {
      return object.kind == 'inline';
    },
    validate: function validate(inline) {
      var nodes = inline.nodes;

      var invalids = nodes.filter(function (n) {
        return n.kind != 'inline' && n.kind != 'text';
      });
      return invalids.size ? invalids : null;
    },
    normalize: function normalize(transform, inline, invalids) {
      return invalids.reduce(function (t, n) {
        return t.removeNodeByKey(n.key);
      }, transform);
    }
  };

  /**
   * The default schema.
   *
   * @type {Object}
   */

  var schema = {
    rules: [BLOCK_RENDER_RULE, INLINE_RENDER_RULE, DOCUMENT_CHILDREN_RULE, BLOCK_CHILDREN_RULE, INLINE_CHILDREN_RULE]
  };

  /**
   * Return the core plugin.
   */

  return {
    onBeforeChange: onBeforeChange,
    onBeforeInput: onBeforeInput,
    onBlur: onBlur,
    onCopy: onCopy,
    onCut: onCut,
    onDrop: onDrop,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    onSelect: onSelect,
    schema: schema
  };
}

/**
 * Export.
 */

exports.default = Plugin;