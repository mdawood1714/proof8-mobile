Drop the two Firebase config files here:

  GoogleService-Info.plist   (iOS app in the Firebase project)
  google-services.json       (Android app in the Firebase project)

Then fill extra.googleWebClientId and extra.googleIosClientId in app.json
and run: npx expo prebuild --clean

Neither file is committed - see .gitignore.
