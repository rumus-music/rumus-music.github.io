package com.rumusmusic.app

import android.app.Application
import com.startapp.sdk.adsbase.StartAppSDK

class MyApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        StartAppSDK.initParams(
            applicationContext,
            "205797420"
        ).setReturnAdsEnabled(false)
            .init()
    }
}
