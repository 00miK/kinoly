import { useParams } from 'react-router-dom';

export default function MovieDetail() {
  const { id } = useParams();
  return <h1>Détail du film #{id}</h1>;
}
