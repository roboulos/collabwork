export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Tailwind Test</h1>
      <div className="bg-red-500 text-white p-4 rounded-lg">
        If you see this styled (red background, white text, rounded corners), Tailwind is working!
      </div>
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
    </div>
  );
}