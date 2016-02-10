import test from 'tape';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import MockWrapper from './MockWrapper';
import TabPanel from '../src/TabPanel';

function mockManager() {
  return {
    tabPanels: [],
    activeTabId: null,
    moveFocusCurrent: sinon.spy(),
  };
}

test('TabPanel DOM with only required props and a string child', t => {
  const manager = mockManager();
  const wrapper = ReactTestUtils.renderIntoDocument(
    <MockWrapper mockManager={manager}>
      <TabPanel tabId='foo'>
        bar
      </TabPanel>
    </MockWrapper>
  );
  const element = ReactTestUtils.findRenderedComponentWithType(wrapper, TabPanel);
  const node = ReactDOM.findDOMNode(element);

  t.deepEqual(manager.tabPanels, [{ element, tabId: 'foo' }]);
  t.equal(manager.activeTabId, 'foo');

  t.equal(node.tagName.toLowerCase(), 'div');
  t.notOk(node.getAttribute('id'));
  t.notOk(node.getAttribute('class'));
  t.notOk(node.getAttribute('style'));
  t.equal(node.getAttribute('role'), 'tabpanel');
  t.equal(node.getAttribute('aria-hidden'), 'false');
  t.equal(node.innerHTML, 'bar');

  t.end();
});

test('TabPanel DOM with all possible props and an element child', t => {
  const manager = mockManager();
  const wrapper = ReactTestUtils.renderIntoDocument(
    <MockWrapper mockManager={manager}>
      <TabPanel
        id='foo'
        tabId='foopdedoop'
        className='bar'
        tag='section'
        style={{ top: '1em' }}
      >
        <div>hooha</div>
      </TabPanel>
    </MockWrapper>
  );
  const element = ReactTestUtils.findRenderedComponentWithType(wrapper, TabPanel);
  const node = ReactDOM.findDOMNode(element);

  t.deepEqual(manager.tabPanels, [{ element, tabId: 'foopdedoop' }]);
  t.equal(manager.activeTabId, 'foopdedoop');

  t.equal(node.tagName.toLowerCase(), 'section');
  t.equal(node.getAttribute('id'), 'foo');
  t.equal(node.getAttribute('class'), 'bar');
  t.equal(node.getAttribute('style').replace(/[ ;]/g, ''), 'top:1em');
  t.equal(node.getAttribute('role'), 'tabpanel');
  t.equal(node.getAttribute('aria-hidden'), 'false');
  t.equal(node.children.length, 1);
  t.equal(node.firstChild.tagName.toLowerCase(), 'div');
  t.equal(node.firstChild.innerHTML, 'hooha');

  t.end();
});

test('TabPanel that is not first to register, is not active', t => {
  const manager = mockManager();
  manager.tabPanels.push({ tabId: 'prior' });
  manager.activeTabId = 'prior';
  const wrapper = ReactTestUtils.renderIntoDocument(
    <MockWrapper mockManager={manager}>
      <TabPanel tabId='foo'>
        bar
      </TabPanel>
    </MockWrapper>
  );
  const element = ReactTestUtils.findRenderedComponentWithType(wrapper, TabPanel);
  const node = ReactDOM.findDOMNode(element);

  t.deepEqual(manager.tabPanels, [{ tabId: 'prior' }, { element, tabId: 'foo' }]);
  t.equal(manager.activeTabId, 'prior');

  t.equal(node.tagName.toLowerCase(), 'div');
  t.equal(node.getAttribute('aria-hidden'), 'true');
  t.equal(node.children.innerHTML, undefined);

  t.end();
});

test('Active TabPanel with a function child', t => {
  const manager = mockManager();
  const child = sinon.spy();
  ReactTestUtils.renderIntoDocument(
    <MockWrapper mockManager={manager}>
      <TabPanel tabId='foo'>
        {child}
      </TabPanel>
    </MockWrapper>
  );

  t.ok(child.calledOnce);
  t.deepEqual(child.getCall(0).args, [{ isActive: true }]);

  t.end();
});

test('Inactive TabPanel with a function child', t => {
  const manager = mockManager();
  manager.tabPanels.push({ tabId: 'prior' });
  manager.activeTabId = 'prior';
  const child = sinon.spy();
  ReactTestUtils.renderIntoDocument(
    <MockWrapper mockManager={manager}>
      <TabPanel tabId='foo'>
        {child}
      </TabPanel>
    </MockWrapper>
  );

  t.ok(child.calledOnce);
  t.deepEqual(child.getCall(0).args, [{ isActive: false }]);

  t.end();
});

test('TabPanel keydown', t => {
  const ctrlUpEvent = {
    key: 'ArrowUp',
    ctrlKey: true,
    preventDefault: sinon.spy(),
  };
  const upEvent = {
    key: 'ArrowUp',
    ctrlKey: false,
    preventDefault: sinon.spy(),
  };
  const manager = mockManager();
  const wrapper = ReactTestUtils.renderIntoDocument(
    <MockWrapper mockManager={manager}>
      <TabPanel tabId='foo'>
        bar
      </TabPanel>
    </MockWrapper>
  );
  const element = ReactTestUtils.findRenderedComponentWithType(wrapper, TabPanel);
  const node = ReactDOM.findDOMNode(element);

  ReactTestUtils.Simulate.keyDown(node, upEvent);
  t.notOk(manager.moveFocusCurrent.called);
  t.notOk(upEvent.preventDefault.called);

  ReactTestUtils.Simulate.keyDown(node, ctrlUpEvent);
  t.ok(manager.moveFocusCurrent.called);
  t.ok(ctrlUpEvent.preventDefault.called);

  t.end();
});
