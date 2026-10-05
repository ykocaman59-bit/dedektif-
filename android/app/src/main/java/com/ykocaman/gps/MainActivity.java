package com.ykocaman.gps;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth; // Bu satırı ekliyoruz

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Google Auth eklentisini köprüye kaydediyoruz
        registerPlugin(GoogleAuth.class);
    }
}
