import { useParams } from 'react-router-dom';

function UserDetailsPage() {
  const { id } = useParams();

  return (
    <section>
      <h1>User Details</h1>
      <p>User ID: {id}</p>
      <p>User details will be built in Phase 4.</p>
    </section>
  );
}

export default UserDetailsPage;
