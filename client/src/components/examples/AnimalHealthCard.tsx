import AnimalHealthCard from '../AnimalHealthCard';

export default function AnimalHealthCardExample() {
  return (
    <div className="p-4 max-w-xs">
      <AnimalHealthCard
        id="1"
        type="Cow #1"
        tagId="KZ-001"
        temperature={38.5}
        heartRate={72}
        status="healthy"
        testId="animal-example"
      />
    </div>
  );
}
