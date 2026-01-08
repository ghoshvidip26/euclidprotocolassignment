const Card = () => {
  return (
    <div className="flex shadow-lg items-center justify-between flex-col bg-white rounded-3xl max-w-sm p-6 border-gray-300 border-2 rounded-base shadow-gray-200 hover:bg-neutral-secondary-medium">
      <h5 className="mb-3 text-2xl font-semibold tracking-tight text-heading leading-8">
        Noteworthy technology acquisitions 2021
      </h5>
      <p className="text-body">
        Here are the biggest technology acquisitions of 2025 so far, in reverse
        chronological order.
      </p>
    </div>
  );
};

export default Card;
