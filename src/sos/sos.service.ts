import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSOSDto } from './dto/create-sos.dto';

@Injectable()
export class SosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createSosDto: CreateSOSDto, userId: string) {
    console.log(`Checking user with ID: ${userId}`);

    const supabase = this.supabaseService.client;
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('❌ [createSosAlert] User check failed:', userError);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const sosAlertData = {
      id: crypto.randomUUID(),
      userid: userId,
      severitygrade: createSosDto.severitygrade,
      emergencytype: createSosDto.emergencytype,
      description: createSosDto.description,
      latitude: createSosDto.latitude,
      longitude: createSosDto.longitude,
      status: 'pending',
      createdat: new Date(),
      updatedat: new Date(),
      contactinfo: createSosDto.contactinfo,
      responsetime: createSosDto.responsetime ? new Date(createSosDto.responsetime) : null,
      additionalnotes: createSosDto.additionalnotes,
      handledby: createSosDto.handledby,
      priority: createSosDto.priority ?? 1,
      phonenumber: createSosDto.phonenumber,
      incidentstarttime: createSosDto.incidentstarttime ? new Date(createSosDto.incidentstarttime) : null,
    };

    const { data: sosAlert, error } = await supabase
      .from('SOSAlert')
      .insert([sosAlertData])
      .select()
      .single();

    if (error) {
      console.error('❌ [createSosAlert] Failed to insert into Supabase:', error);
      throw new HttpException('Failed to create SOS alert', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { ...sosAlert, user };
  }

  async getAll() {
    const supabase = this.supabaseService.client;

    const { data: sosAlerts, error: sosError } = await supabase
      .from('SOSAlert')
      .select('*');

    if (sosError) {
      console.error('❌ [getAll] Failed to fetch SOS alerts from Supabase:', sosError);
      throw new HttpException('Failed to fetch SOS alerts', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!sosAlerts || sosAlerts.length === 0) {
      console.log('📢 [getAll] No SOS alerts found');
      return [];
    }

    const userIds = [...new Set(sosAlerts.map(alert => alert.userid))];
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    if (userError) {
      console.error('❌ [getAll] Failed to fetch users from Supabase:', userError);
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const userMap = new Map(users.map(user => [user.id, user]));
    const result = sosAlerts.map(alert => ({
      ...alert,
      user: userMap.get(alert.userid) || null,
    }));

    console.log(`📢 [getAll] Successfully fetched ${result.length} SOS alerts`);
    return result;
  }

  async updateStatus(id: string, status: string) {
    const supabase = this.supabaseService.client;

    const { data: existing, error: fetchError } = await supabase
      .from('SOSAlert')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      console.error('❌ [updateStatus] Failed to fetch SOS alert from Supabase:', fetchError);
      throw new NotFoundException('SOS Alert not found');
    }

    const { data: updatedAlert, error: updateError } = await supabase
      .from('SOSAlert')
      .update({ status, updatedat: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [updateStatus] Failed to update SOS alert in Supabase:', updateError);
      throw new HttpException('Failed to update SOS alert', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    console.log(`📢 [updateStatus] Successfully updated SOS alert with id: ${id} to status: ${status}`);
    return updatedAlert;
  }
}