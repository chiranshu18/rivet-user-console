import { useParams } from 'react-router-dom';

function UserSessionsPage() {
  const { id } = useParams();

  return (
    <section>
      <h1>User Sessions</h1>
      <p>User ID: {id}</p>
      <p>User sessions will be built in Phase 5.</p>
    </section>
  );
}

export default UserSessionsPage;
