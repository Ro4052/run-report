import { Page } from "../components/Page";

const PrivacyAndCookies = () => (
  <Page showFooter={false}>
    This website uses Cookies and, with your consent, consumes your personal data from Strava.
    <br/>
    <br/>
    The only personal data saved by this website is your unique public Strava identifier and the information required to retrieve activity data
    from Strava. No activity or profile data is saved by this website. Should you wish to remove your data from this website, you can&nbsp;
    <a className='text-teal-500 dark:text-teal-300 hover:underline' href='https://www.strava.com/settings/apps' target='_blank' rel='noreferrer'>
      revoke the website&apos;s access to your Strava data
    </a>. Revoking access to the website will remove your saved information and the website will no longer be able to access your activity
    data.
    <br/>
    <br/>
    This website uses cookies to store your public Strava identifier so that full authentication is not required on each visit to the site. By
    using this site, you agree to this cookie usage. This website does not using tracking cookies.
  </Page>
);

export default PrivacyAndCookies;
