package database;

import classes.News;
import classes.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 * This class handles adding/removing/getting news
 * from the database
 *
 */
public class NewsDAO {

    /**
     * Used to get all news for a household from the database
     *
     * @param houseId the id of the household
     * @return a list of {@link News} objects
     */
    public static ArrayList<News> getNews(int houseId){
        ArrayList<News> news = new ArrayList<>();
        String query = "SELECT * FROM (Message NATURAL JOIN Person) WHERE houseId = ? ORDER BY date DESC;";

        try (DBConnector dbc = new DBConnector();
             Connection conn = dbc.getConn();
             PreparedStatement st = conn.prepareStatement(query)) {

            st.setInt(1, houseId);

            try (ResultSet rs = st.executeQuery()) {

                while (rs.next()) {
                    User user = new User();
                    user.setUserId(rs.getInt("userId"));
                    user.setName(rs.getString("name"));
                    user.setEmail(rs.getString("email"));
                    user.setTelephone(rs.getString("telephone"));
                    user.setProfileImage(rs.getString("image"));

                    News toAdd = new News();
                    toAdd.setHouseId(houseId);
                    toAdd.setNewsId(rs.getInt("messageId"));
                    toAdd.setMessage(rs.getString("text"));
                    toAdd.setUser(user);
                    toAdd.setTime(rs.getTimestamp("date").toLocalDateTime());

                    news.add(toAdd);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return news;
    }

    /**
     * Used to post news to the database
     *
     * @param news the {@link News} object to add
     * @return 1 for success 0 for fail
     */
    public static int postNews(News news){
        String message = news.getMessage();
        String query = "INSERT INTO Message(text, houseId, userId) VALUES (?,?,?)";

        if (message!=null&&!message.equals("")) {
            try (DBConnector dbc = new DBConnector();
                 Connection conn = dbc.getConn();
                 PreparedStatement st = conn.prepareStatement(query)) {

                st.setString(1, news.getMessage());
                st.setInt(2, news.getHouseId());
                st.setInt(3, news.getUserId());

                return st.executeUpdate();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return 0;
    }

    /**
     * Used to delete news from the database
     *
     * @param msgId the message id
     * @return 1 for success 0 for fail
     */
    public static int deleteNews(int msgId){
        String query = "DELETE FROM Message WHERE messageId=?";

        try (DBConnector dbc = new DBConnector();
             Connection conn = dbc.getConn();
             PreparedStatement st = conn.prepareStatement(query)) {

            st.setInt(1,msgId);

            return st.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }
}
