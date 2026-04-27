const API_URL = "https://jsonplaceholder.typicode.com/users";

async function fetchContacts() {
  const response = await fetch(API_URL);
  const data = await response.json();
  displayContacts(data);
}

//* Display Contacts //

function displayContacts(contacts) {
  const list = document.getElementById("contactList");
  list.innerHTML = "";

  contacts.forEach(contact => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${contact.name} - ${contact.phone}
      <button onclick="deleteContact(${contact.id})">❌</button>
    `;
    list.appendChild(li);
  });
}
//* Add Contact //
async function addContact() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;

  if (!name || !phone) {
    alert("Please enter details");
    return;
  }

  const newContact = { name, phone };

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(newContact),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  alert("Contact Added!");

  fetchContacts();
}
// Delete Contact //
async function deleteContact(id) {
  await fetch(
    $(API_URL)/$(id), {
    method: "DELETE"
  });

  alert("Contact Deleted!");
  fetchContacts();
}
//* Update Contact //
async function updateContact(id) {
  const newName = prompt("Enter new name");

  if (!newName) return;

  await fetch($(API_URL)/$(id), {
    method: "PUT",
    body: JSON.stringify({ name: newName }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  alert("Updated!");
  fetchContacts();
}

//* Load App //

fetchContacts();