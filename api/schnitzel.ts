export default function handler(request: any, response: any) {
  response.status(200).json({
    body: "Hello, Schnitzel!",
  });
}
