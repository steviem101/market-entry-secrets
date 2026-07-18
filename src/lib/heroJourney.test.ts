import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { topLeadCategories, JOURNEY_STEP_ORDER } from './heroJourney.ts';

describe('topLeadCategories', () => {
  it('returns [] for undefined input', () => {
    assert.deepEqual(topLeadCategories(undefined), []);
  });

  it('sorts by count desc with label asc tie-break and caps at max', () => {
    const summary = topLeadCategories(
      { Retail: 5, Fintech: 9, Health: 5, Mining: 2, Agtech: 1 },
      4,
    );
    assert.deepEqual(summary, [
      { label: 'Fintech', count: 9 },
      { label: 'Health', count: 5 },
      { label: 'Retail', count: 5 },
      { label: 'Mining', count: 2 },
    ]);
  });

  it('drops junk sentinel labels and non-positive counts', () => {
    const summary = topLeadCategories({
      Unknown: 50,
      'N/A': 20,
      '-': 10,
      '': 8,
      Fintech: 3,
      Empty: 0,
    });
    assert.deepEqual(summary, [{ label: 'Fintech', count: 3 }]);
  });
});

describe('JOURNEY_STEP_ORDER', () => {
  it('tells the full story in order: report → leads → introductions', () => {
    assert.deepEqual(JOURNEY_STEP_ORDER, ['report', 'leads', 'introductions']);
  });
});
