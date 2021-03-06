package classes;


import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

/**
 * <p>Email class.</p>
 *
 */
public class Email {

    /**
     * GMail user name (just the part before "@gmail.com"), that the mail is going to be sent from.
     */
    private static final String USER_NAME = "noreply.householdmanager";  // GMail user name (just the part before "@gmail.com")

    /**
     * Password to the GMail that the mail is going to be sent from
     */
    private static final String PASSWORD = "panasonic5";

    /**
     * Takes an Array with recipients, a subject and a text body that will be sent through Google.
     *
     * @param to String[] that contains the recipient(s) of the mail
     * @param subject subject of the mail (that thing that is bold when you look at your mail inbox
     * @param body body of the mail (what you want to write in the mail)
     */
    public static void sendMail(String to, String subject, String body) {
        Properties props = System.getProperties();
        String host = "smtp.gmail.com";
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.user", USER_NAME);
        props.put("mail.smtp.password", PASSWORD);
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");

        Session session = Session.getDefaultInstance(props);
        MimeMessage message = new MimeMessage(session);

        try {
            message.setFrom(new InternetAddress(USER_NAME));
            InternetAddress toAddress = new InternetAddress(to);

            message.addRecipient(Message.RecipientType.TO, toAddress);

            message.setSubject(subject);
            message.setText(body);
            Transport transport = session.getTransport("smtp");
            transport.connect(host, USER_NAME, PASSWORD);
            transport.sendMessage(message, message.getAllRecipients());
            System.out.println("Mail sent to "+to);
            transport.close();
        }
        catch (Exception ae) {
            ae.printStackTrace();
        }
    }
}
