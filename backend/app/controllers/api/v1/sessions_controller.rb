class API::V1::SessionsController < Devise::SessionsController
  include ::RackSessionsFix
  respond_to :json
  private
  def respond_with(current_user, _opts = {})
    render json: {
      status: { 
        code: 200, message: {current_user: current_user},
        data: { user: UserSerializer.new(current_user).serializable_hash[:data][:attributes] },
        token: request.env['warden-jwt_auth.token']
        
      }
    }, status: :ok
    
  end
  def respond_to_on_destroy
    if request.headers['Authorization'].present?
      token = request.headers['Authorization'].split(' ').last
      puts "Decoding token: #{token}" # Log the token for debugging
      jwt_secret_key = Rails.application.credentials.devise_jwt_secret_key
  
      begin
        decoded_token = JWT.decode(token, jwt_secret_key, true, { algorithm: 'HS256' })
      rescue JWT::DecodeError => e
        Rails.logger.error("JWT Decode Error: #{e.message}")
        render json: { error: "Token decode error: #{e.message}" }, status: :unprocessable_entity and return
      end
    else
      render json: { error: 'Authorization header missing' }, status: :unauthorized and return
    end
    
    if current_user
      render json: {
        status: 200,
        message: 'Logged out successfully.'
      }, status: :ok
    else
      render json: {
        status: 401,
        message: "Couldn't find an active session."
      }, status: :unauthorized
    end
  end
end
