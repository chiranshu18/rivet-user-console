import NotFoundState from '../../components/NotFoundState/NotFoundState';

function NotFoundPage() {
  return (
    <section>
      <NotFoundState
        code="404"
        title="Page not found"
        message="The page you are looking for does not exist."
      />
    </section>
  );
}

export default NotFoundPage;
