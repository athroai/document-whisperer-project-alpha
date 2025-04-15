
export async function extractTextFromImageWithMathpix(file: File): Promise<{
  text: string;
  latex: string;
  latexConfidence: number;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('options_json', JSON.stringify({
    formats: ['text', 'latex_styled'],
    math_inline_delimiters: ['$', '$'],
    rm_spaces: true,
    include_line_data: false
  }));

  const res = await fetch('https://api.mathpix.com/v3/text', {
    method: 'POST',
    headers: {
      'app_id': 'athroai_9d03b5_32fcac',
      'app_key': '3df987dfa52f28edc4f6ec25c007abbffa9cb3d359013cee28a48c8524c2087b',
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const result = await res.json();
  return {
    text: result.text || '',
    latex: result.latex_styled || '',
    latexConfidence: result.latex_confidence || 0,
  };
}
