package app.lovable.vrs;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MediaSessionPlugin")
public class MediaSessionPlugin extends Plugin {

    @PluginMethod
    public void updateMetadata(PluginCall call) {
        String title = call.getString("title");
        String artist = call.getString("artist");
        String album = call.getString("album");
        String imageUrl = call.getString("imageUrl");

        MainActivity activity = (MainActivity) getActivity();
        if (activity != null) {
            activity.updateMediaMetadata(title, artist, album, imageUrl);
            call.resolve();
        } else {
            call.reject("Activity not found");
        }
    }
}
