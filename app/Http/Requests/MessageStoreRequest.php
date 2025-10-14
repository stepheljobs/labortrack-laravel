<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiRequest;
use Illuminate\Http\UploadedFile;

class MessageStoreRequest extends ApiRequest
{
    protected function prepareForValidation(): void
    {
        $photo = $this->input('photo');

        $candidate = null;
        if (is_string($photo)) {
            $candidate = $photo;
        } elseif (is_array($photo)) {
            $keys = ['base64', 'data', 'content', 'value', 'dataUri', 'uri'];
            foreach ($keys as $key) {
                if (isset($photo[$key]) && is_string($photo[$key])) {
                    $value = $photo[$key];
                    if ($key === 'uri' && !str_starts_with($value, 'data:image')) {
                        continue;
                    }
                    $candidate = $value;
                    break;
                }
            }
        }

        // Normalize empty string or empty array photo to null so 'file' rule doesn't trigger
        if ($photo === '' || $photo === null || (is_array($photo) && count($photo) === 0)) {
            $this->merge(['photo' => null]);
        }

        if (is_string($candidate)) {
            [$binary, $extension] = $this->decodeBase64Image($candidate);

            if ($binary !== null) {
                $tmpPath = tempnam(sys_get_temp_dir(), 'msg_');
                if ($tmpPath !== false) {
                    file_put_contents($tmpPath, $binary);

                    $finfo = finfo_open(\FILEINFO_MIME_TYPE);
                    $mime = $finfo ? finfo_file($finfo, $tmpPath) : null;
                    if ($finfo) {
                        finfo_close($finfo);
                    }

                    $guessedExtension = null;
                    if (is_string($mime) && str_contains($mime, '/')) {
                        $guessedExtension = explode('/', $mime)[1];
                    }

                    $filename = 'photo.' . ($extension ?: ($guessedExtension ?: 'jpg'));

                    $uploaded = new UploadedFile(
                        $tmpPath,
                        $filename,
                        $mime ?: 'image/jpeg',
                        null,
                        true
                    );

                    $this->files->set('photo', $uploaded);
                }
            }
        }
    }

    private function decodeBase64Image(string $input): array
    {
        $pattern = '/^data:image\/(png|jpe?g|gif|webp);base64,(.*)$/i';
        if (preg_match($pattern, $input, $matches)) {
            $ext = strtolower($matches[1]) === 'jpeg' ? 'jpg' : strtolower($matches[1]);
            $data = base64_decode($matches[2], true);
            if ($data === false) {
                return [null, null];
            }
            return [$data, $ext];
        }

        $data = base64_decode($input, true);
        if ($data === false) {
            return [null, null];
        }
        return [$data, null];
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['nullable', 'string'],
            // Accept nullable to avoid "must be a file" when client includes empty photo key
            'photo' => ['required_without:message', 'nullable', 'file', 'image', 'max:5120'],
        ];
    }
}
