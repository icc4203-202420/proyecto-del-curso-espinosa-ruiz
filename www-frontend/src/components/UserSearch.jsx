import React, { useState } from 'react';

function UserSearch() {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Aún no se implementa la llamada a la API
    console.log(`Searching for user with handle: ${search}`);
  };

  return (
    <div>
      <h2>Search Users</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Enter user handle"
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
}

export default UserSearch;
