import * as ImagePicker from 'expo-image-picker';

export type PickedMedia = { uri: string; type: 'image' | 'video'; width: number; height: number; durationMs: number | null; mimeType: string | null };

const toPicked = (a: ImagePicker.ImagePickerAsset): PickedMedia => ({
  uri: a.uri,
  type: a.type === 'video' ? 'video' : 'image',
  width: a.width,
  height: a.height,
  durationMs: a.duration ?? null,
  mimeType: a.mimeType ?? null,
});

/** Android Photo Picker (no READ_MEDIA_* permission needed on 13+); multi-select up to `limit`. */
export async function pickFromLibrary(kind: 'post' | 'loop' | 'story', limit = 10): Promise<PickedMedia[]> {
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: kind === 'loop' ? ['videos'] : ['images', 'videos'],
    allowsMultipleSelection: kind === 'post',
    selectionLimit: kind === 'post' ? limit : 1,
    quality: 0.9,
    videoMaxDuration: kind === 'loop' ? 60 : 30,
    orderedSelection: true,
  });
  return r.canceled ? [] : r.assets.map(toPicked);
}

export async function captureWithCamera(kind: 'post' | 'loop' | 'story'): Promise<PickedMedia | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const r = await ImagePicker.launchCameraAsync({
    mediaTypes: kind === 'loop' ? ['videos'] : ['images', 'videos'],
    quality: 0.9,
    videoMaxDuration: kind === 'loop' ? 60 : 30,
    cameraType: ImagePicker.CameraType.back,
  });
  return r.canceled ? null : toPicked(r.assets[0]);
}
