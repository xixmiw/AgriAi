import AIRecommendationCard from '../AIRecommendationCard';

export default function AIRecommendationCardExample() {
  return (
    <div className="p-4 max-w-2xl">
      <AIRecommendationCard
        title="AI Recommendations"
        recommendations={[
          'Apply nitrogen fertilizers to North field',
          'Weather conditions are favorable for planting',
          'High-protein feed will increase milk production',
        ]}
        category="Gemini AI"
        testId="ai-example"
      />
    </div>
  );
}
