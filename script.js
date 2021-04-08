const $modal = $('.js-modal');
const $modalButton = $('.js-input-button');
const $inputButton = $('.js-add-input-button');

const $modalEdit = $('.js-modal-edit');
const $modalEditButton = $('.js-list-issue-edit-button');
const $buttonConfirmEdit = $('.js-confirm-edit-button');

const $list = $('.js-list');
const $inputEdit = $('.input-edit-issue');

const inputValue = document.forms.group;
const editValue = document.forms.edit;

let parentId;
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
	confirmEditEventListener()
}
//EVENT LISTENERS
function inputModalButtonEventListener() {
	$modalButton.on('click', () => {
		$modal.dialog('open')
	})
}

function inputButtonEventListener() {
	$inputButton.on('click', () => {
		createIssue();
		$modal.dialog('close');
	})
}

function deleteIssueEventListener() {
	$list.on('click', (event) => {
		if (event.target.classList.contains('list-issue-delete-button')) {
			deleteIssue(event);
		}
	})
}

function modalEditButtonEventListener() {
	$list.on('click', (event) => {
		if (event.target.classList.contains('js-list-issue-edit-button')) {
			$modalEdit.dialog('open');
			$inputEdit.val(event.target.previousElementSibling.textContent);
			parentId = event.target.closest('li.list-issue').getAttribute('data-id');
		}
	})
}

function confirmEditEventListener() {
	$buttonConfirmEdit.on('click', () => {
		const issue =
			createEditedIssue();
		$modalEdit.dialog('close');
	})
}
//REQUESTS
function sendGetListRequest() {
	return fetch('https://jsonplaceholder.typicode.com/todos')
		.then((response) => response.json())
}

function sendPostListRequest(issue) {
	return fetch('https://jsonplaceholder.typicode.com/todos', {
			method: 'POST',
			body: JSON.stringify(issue),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
		.then((response) => response.json())
}

function sendPatchEditRequest(issue) {
	return fetch(`https://jsonplaceholder.typicode.com/todos/${parentId}`, {
			method: 'PATCH',
			body: JSON.stringify(issue),
			headers: {
				'Content-type': 'application/json; charset=UTF-8',
			},
		})
		.then((response) => response.json())
}

function sendDeleteListRequest(id) {
	return fetch(`https://jsonplaceholder.typicode.com/todos/'${id}'`, {
		method: 'DELETE'
	})
}

function sendGetIssueRequest(idIssue) {
	return fetch(`https://jsonplaceholder.typicode.com/todos/${idIssue}`)
		.then((response) => response.json())
		.then((issue) => {
			const newIssue = {
				...issue,
				completed: !issue.completed,
			};
			return fetch(`https://jsonplaceholder.typicode.com/todos/${idIssue}`, {
				method: 'PUT',
				body: JSON.stringify(newIssue),
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
				},
			})
		})
}
//RENDER 
function renderList(issues) {
	const listItems = issues.map(issue => toDoItem(issue));
	$list.append(listItems);
}

function renderIssue(issue) {
	$list.prepend(toDoItem(issue));
}

function renderEditIssue(issue) {
	$list.prepend(toDoItem(issue));
}
//LOGIC
function getListItems() {
	const listRequest = sendGetListRequest();
	listRequest.then((issues) => renderList(issues))
}

function createIssue() {
	const issue = getFormData();
	sendPostListRequest(issue)
		.then((issue) => {
			clearInput();
			renderIssue(issue);
		});
}

function createEditedIssue() {
	const issue = getFormEditData();
	sendPatchEditRequest(issue)
		.then((issue) => {
			const $paragraph = $(`li[data-id="${parentId}"] > p`);
			editValue[1].checked ? $paragraph.addClass(`done`) : $paragraph.removeClass(`done`);
			$paragraph.text(issue.title);
		})
}

function getFormData() {
	const formData = new FormData(inputValue);
	return {
		title: formData.get("group"),
		completed: inputValue[1].checked,
		userId: $list.children.length + 1,
	}
}

function getFormEditData() {
	const formEditData = new FormData(editValue);
	return {
		title: formEditData.get("input-edit-item"),
		completed: editValue[1].checked,
	}
}

function clearInput() {
	inputValue.reset();
}

function toDoItem(issue) {
	const doneClass = issue.completed ? 'done' : 'not-done';
	return `
		<li data-id="${issue.id}" class="list-issue">
			<p class="list-issue-text ${doneClass}">${issue.title}</p>
			<i class="button js-list-issue-edit-button far fa-edit"></i>
			<i class="button list-issue-delete-button far fa-trash-alt"></i>
		</li>
		`
}

function deleteIssue(event) {
	const parentList = event.target.closest('li');
	const id = parentList.dataset.id;
	sendDeleteListRequest(id)
		.then(() => {
			const issueDelete = $(`li[data-id ='${id}']`);
			issueDelete.remove();
		});
}