import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { ToastOptions, ToastType, ToastAction } from '../../src/components/ui/Toast.tsx';

describe('Unit Tests: Toast Notification Interface', () => {
  it('supports all semantic toast notification types', () => {
    const types: ToastType[] = ['success', 'info', 'warning', 'error'];
    assert.equal(types.length, 4);
    assert.ok(types.includes('success'));
    assert.ok(types.includes('info'));
    assert.ok(types.includes('warning'));
    assert.ok(types.includes('error'));
  });

  it('correctly constructs a ToastOptions object with Undo action', () => {
    let actionExecuted = false;
    const action: ToastAction = {
      label: 'Undo',
      onClick: () => {
        actionExecuted = true;
      },
    };

    const options: ToastOptions = {
      message: 'Saved to Watchlist',
      description: 'Organic Whole Milk 1 Gallon',
      type: 'success',
      duration: 4500,
      action,
    };

    assert.equal(options.message, 'Saved to Watchlist');
    assert.equal(options.description, 'Organic Whole Milk 1 Gallon');
    assert.equal(options.type, 'success');
    assert.equal(options.duration, 4500);
    assert.equal(options.action?.label, 'Undo');

    options.action?.onClick();
    assert.equal(actionExecuted, true);
  });
});
