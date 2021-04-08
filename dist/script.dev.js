"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var $modal = $('.js-modal');
var $modalButton = $('.js-input-button');
var $inputButton = $('.js-add-input-button');
var $modalEdit = $('.js-modal-edit');
var $modalEditButton = $('.js-list-issue-edit-button');
var $buttonConfirmEdit = $('.js-confirm-edit-button');
var $list = $('.js-list');
var $inputEdit = $('.input-edit-issue');
var inputValue = document.forms.group;
var editValue = document.forms.edit;
var parentId;
init();

function init() {
  $modalEdit.dialog({
    autoOpen: false,
    modal: true,
    hide: {
      effect: "drop",
      duration: 800
    }
  });
  $modal.dialog({
    autoOpen: false,
    modal: true,
    hide: {
      effect: "drop",
      duration: 800
    }
  });
  getListItems();
  inputButtonEventListener();
  inputModalButtonEventListener();
  modalEditButtonEventListener();
  deleteIssueEventListener();
  confirmEditEventListener();
} //EVENT LISTENERS


function inputModalButtonEventListener() {
  $modalButton.on('click', function () {
    $modal.dialog('open');
  });
}

function inputButtonEventListener() {
  $inputButton.on('click', function () {
    createIssue();
    $modal.dialog('close');
  });
}

function deleteIssueEventListener() {
  $list.on('click', function (event) {
    if (event.target.classList.contains('list-issue-delete-button')) {
      deleteIssue(event);
    }
  });
}

function modalEditButtonEventListener() {
  $list.on('click', function (event) {
    if (event.target.classList.contains('js-list-issue-edit-button')) {
      $modalEdit.dialog('open');
      $inputEdit.val(event.target.previousElementSibling.textContent);
      parentId = event.target.closest('li.list-issue').getAttribute('data-id');
    }
  });
}

function confirmEditEventListener() {
  $buttonConfirmEdit.on('click', function () {
    var issue = createEditedIssue();
    $modalEdit.dialog('close');
  });
} //REQUESTS


function sendGetListRequest() {
  return fetch('https://jsonplaceholder.typicode.com/todos').then(function (response) {
    return response.json();
  });
}

function sendPostListRequest(issue) {
  return fetch('https://jsonplaceholder.typicode.com/todos', {
    method: 'POST',
    body: JSON.stringify(issue),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }).then(function (response) {
    return response.json();
  });
}

function sendPatchEditRequest(issue) {
  return fetch("https://jsonplaceholder.typicode.com/todos/".concat(parentId), {
    method: 'PATCH',
    body: JSON.stringify(issue),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }).then(function (response) {
    return response.json();
  });
}

function sendDeleteListRequest(id) {
  return fetch("https://jsonplaceholder.typicode.com/todos/'".concat(id, "'"), {
    method: 'DELETE'
  });
}

function sendGetIssueRequest(idIssue) {
  return fetch("https://jsonplaceholder.typicode.com/todos/".concat(idIssue)).then(function (response) {
    return response.json();
  }).then(function (issue) {
    var newIssue = _objectSpread({}, issue, {
      completed: !issue.completed
    });

    return fetch("https://jsonplaceholder.typicode.com/todos/".concat(idIssue), {
      method: 'PUT',
      body: JSON.stringify(newIssue),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    });
  });
} //RENDER 


function renderList(issues) {
  var listItems = issues.map(function (issue) {
    return toDoItem(issue);
  });
  $list.append(listItems);
}

function renderIssue(issue) {
  $list.prepend(toDoItem(issue));
}

function renderEditIssue(issue) {
  $list.prepend(toDoItem(issue));
} //LOGIC


function getListItems() {
  var listRequest = sendGetListRequest();
  listRequest.then(function (issues) {
    return renderList(issues);
  });
}

function createIssue() {
  var issue = getFormData();
  sendPostListRequest(issue).then(function (issue) {
    clearInput();
    renderIssue(issue);
  });
}

function createEditedIssue() {
  var issue = getFormEditData();
  sendPatchEditRequest(issue).then(function (issue) {
    var $paragraph = $("li[data-id=\"".concat(parentId, "\"] > p"));
    editValue[1].checked ? $paragraph.addClass("done") : $paragraph.removeClass("done");
    $paragraph.text(issue.title);
  });
}

function getFormData() {
  var formData = new FormData(inputValue);
  return {
    title: formData.get("group"),
    completed: inputValue[1].checked,
    userId: $list.children.length + 1
  };
}

function getFormEditData() {
  var formEditData = new FormData(editValue);
  return {
    title: formEditData.get("input-edit-item"),
    completed: editValue[1].checked
  };
}

function clearInput() {
  inputValue.reset();
}

function toDoItem(issue) {
  var doneClass = issue.completed ? 'done' : 'not-done';
  return "\n\t\t<li data-id=\"".concat(issue.id, "\" class=\"list-issue\">\n\t\t\t<p class=\"list-issue-text ").concat(doneClass, "\">").concat(issue.title, "</p>\n\t\t\t<i class=\"button js-list-issue-edit-button far fa-edit\"></i>\n\t\t\t<i class=\"button list-issue-delete-button far fa-trash-alt\"></i>\n\t\t</li>\n\t\t");
}

function deleteIssue(event) {
  var parentList = event.target.closest('li');
  var id = parentList.dataset.id;
  sendDeleteListRequest(id).then(function () {
    var issueDelete = $("li[data-id ='".concat(id, "']"));
    issueDelete.remove();
  });
}